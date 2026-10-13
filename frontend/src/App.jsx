import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './Dashboard/Dashboard';
import Register from './register/Register';
import Login from './login/Login';
import SeekerDashboard from './seeker/SeekerDashboard';
import AvailableJobs from './Available/AvailableJobs';
import OrganizerDashboard from './organizer/OrganizerDashboard';
import OrganizerPostJob from './postJob/OrganizerPostJob';
import MyProfile from './profile/MyProfile';
import LearnSkills from './learn/LearnSkills';
import { UserProvider } from './context/UserContext';
import AboutPage from './About/AboutPage';
import ContactPage from './Contact/ContactPage';
import Applications from './applications/Applications';
import Chatbox from './chatbot/Chatbox';
import ChatbotButton from './chatbot/ChatbotButton';
import ResumeAnalyzer from './ResumeAnalyzer';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatOpen((previous) => !previous);
  };

  const closeChatbot = () => {
    setIsChatOpen(false);
  };

  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
          <Route path="/available-jobs" element={<AvailableJobs />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/post-job" element={<OrganizerPostJob />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/learn-skills" element={<LearnSkills />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/organizer/about" element={<AboutPage />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/applications" element={<Applications />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        </Routes>

        <Chatbox isOpen={isChatOpen} onClose={closeChatbot} />
        <ChatbotButton onClick={toggleChatbot} isOpen={isChatOpen} />
      </UserProvider>
    </Router>
  );
}

export default App;
