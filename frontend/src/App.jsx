import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PreviewBanner from './components/common/PreviewBanner';

// Pages
import HomePage from './pages/public/HomePage';
import AlumniDirectoryPage from './pages/public/AlumniDirectoryPage';
import EventsPage from './pages/public/EventsPage';
import JobsPage from './pages/public/JobsPage';
import MentorshipPage from './pages/public/MentorshipPage';
import ChaptersPage from './pages/public/ChaptersPage';
import StoriesPage from './pages/public/StoriesPage';
import NewsGalleryPage from './pages/public/NewsGalleryPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/directory" element={<AlumniDirectoryPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/mentorship" element={<MentorshipPage />} />
                <Route path="/chapters" element={<ChaptersPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/news-gallery" element={<NewsGalleryPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Role Dashboards */}
                <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
            {/* Bottom-fixed bar — yahin render hona chahiye taaki top par gap na aaye */}
            <PreviewBanner />
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
