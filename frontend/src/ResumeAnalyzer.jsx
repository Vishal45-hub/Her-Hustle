import { useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Upload resume first");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/ai/analyze-resume",
        formData
      );

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Resume Analyzer</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-pink-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">
            Score: {result.score}/100
          </h2>

          <div>
            <h3 className="font-semibold">✅ Strengths</h3>
            <ul>
              {result.strengths.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">❌ Weaknesses</h3>
            <ul>
              {result.weaknesses.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">🧠 Missing Skills</h3>
            <ul>
              {result.missingSkills.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">✨ Suggestions</h3>
            <ul>
              {result.suggestions.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">🎯 ATS Tips</h3>
            <ul>
              {result.atsTips.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}