import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Award, MessageSquare, Briefcase, CheckCircle2, Clock, User, Save, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [profileRes, mentorshipsRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/my-mentorships')
        ]);
        if (profileRes.status) setProfile(profileRes.data);
        if (mentorshipsRes.status) setMentorships(mentorshipsRes.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/student/profile', profile);
      if (res.status) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error updating student profile');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="student-dashboard py-4 bg-white min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm" style={{ backgroundColor: 'var(--akal-navy)', borderBottom: '3px solid var(--akal-yellow)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
                <GraduationCap size={16} />
                <span>STUDENT HUB & CAREER ACCELERATOR</span>
              </div>
              <h2 className="fw-bold mb-2 text-white">
                Hello, {profile?.first_name}{profile?.last_name ? ` ${profile.last_name}` : ''}!
              </h2>
              <p className="text-white-50 mb-0">
                {profile?.degree} • Year {profile?.current_year} (Semester {profile?.semester}) • Enrollment: {profile?.enrollment_no || 'AU-2023'}
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <Link to="/mentorship" className="btn btn-akal-yellow d-inline-flex align-items-center gap-2 shadow-sm">
                <Award size={18} />
                <span>Find an Alumni Mentor</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Col: Active Mentorship Sessions */}
          <div className="col-lg-7">
            <div className="akal-card p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold text-dark mb-0">My Mentorship Requests & Sessions</h5>
                <Link to="/mentorship" className="btn btn-sm btn-link text-primary text-decoration-none">
                  + New Request
                </Link>
              </div>

              {mentorships.length === 0 ? (
                <div className="text-center py-5 text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                  <Award size={42} className="opacity-50 mb-2 text-warning" />
                  <h6>No active mentorship requests</h6>
                  <p className="small text-muted mb-3">Reach out to distinguished alumni in Google, Microsoft, research, or finance for guidance.</p>
                  <Link to="/mentorship" className="btn btn-akal-primary btn-sm">
                    Browse Mentor Directory
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {mentorships.map((m) => (
                    <div key={m.id} className="p-3 bg-light rounded-3 border d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold text-dark">{m.mentor_first_name} {m.mentor_last_name}</div>
                          <div className="text-primary small">{m.current_designation} at {m.current_company}</div>
                        </div>
                        <span className={`badge ${m.status === 'accepted' ? 'bg-success' : m.status === 'completed' ? 'bg-info' : 'bg-warning text-dark'}`}>
                          {m.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="small text-muted">
                        <strong>Topic:</strong> {m.topic}
                      </div>

                      {m.message && (
                        <div className="small text-secondary fst-italic">
                          "{m.message}"
                        </div>
                      )}

                      <div className="small text-muted pt-2 border-top d-flex justify-content-between">
                        <span>Requested: {new Date(m.created_at).toLocaleDateString()}</span>
                        {m.mentor_email && <span className="text-primary">{m.mentor_email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Student Profile Editor */}
          <div className="col-lg-5">
            <div className="akal-card p-4">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Academic & Career Profile</h5>

              {saveSuccess && (
                <div className="alert alert-success small py-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Profile updated!</span>
                </div>
              )}

              {profile && (
                <form onSubmit={handleProfileSave}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Career Interests</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="e.g. Cloud Computing, AI/ML, Consulting"
                      value={profile.career_interests || ''}
                      onChange={(e) => setProfile({ ...profile, career_interests: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Short Bio</label>
                    <textarea 
                      className="form-control form-control-sm"
                      rows="3"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">LinkedIn Profile URL</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-akal-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
