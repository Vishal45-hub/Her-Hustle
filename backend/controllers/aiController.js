const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const extractText = async (filePath, mimetype) => {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error('Unsupported file format');
};

exports.analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No resume uploaded.' });
    }

    filePath = file.path;

    const resumeText = await extractText(file.path, file.mimetype);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: 'The uploaded resume contains no readable text.',
      });
    }

    const prompt = `
Analyze this resume as an ATS resume analyzer and career coach.
Return ONLY valid JSON with this structure:
{
  "score": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "suggestions": ["string"],
  "atsTips": ["string"]
}
The score must be a number from 0 to 100.
All other fields must be arrays of strings.
Do not invent qualifications.

Resume:
${resumeText}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices?.[0]?.message?.content;

    if (!text || typeof text !== 'string') {
      return res.status(502).json({
        message: 'The resume could not be analyzed. Please try again.',
      });
    }

    const cleanedText = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      console.warn('Resume analysis returned invalid JSON.');
      return res.status(502).json({
        message: 'Resume analysis could not be completed. Please try again.',
      });
    }

    const fields = [
      'strengths',
      'weaknesses',
      'missingSkills',
      'suggestions',
      'atsTips',
    ];

    const valid =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof parsed.score === 'number' &&
      Number.isFinite(parsed.score) &&
      parsed.score >= 0 &&
      parsed.score <= 100 &&
      fields.every(
        (key) =>
          Array.isArray(parsed[key]) &&
          parsed[key].every((item) => typeof item === 'string')
      );

    if (!valid) {
      console.warn('Resume analysis returned an invalid response structure.');
      return res.status(502).json({
        message: 'The resume analysis returned an invalid result. Please retry.',
      });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Resume analysis failed:', {
      name: error?.name || 'UnknownError',
      status: error?.status,
    });

    return res.status(500).json({
      message: 'Unable to analyze the resume right now. Please try again.',
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        console.error('Failed to remove temporary resume upload.');
      }
    }
  }
};
