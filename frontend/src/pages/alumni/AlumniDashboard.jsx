import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DigitalIdModal from '../../components/common/DigitalIdModal';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  Save, 
  Send,
  Building,
  GraduationCap
} from 'lucide-react';

const AlumniDashboard = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showIdModal, setShowIdModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Job Posting Form State
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState('full_time');
  const [jobLocation, setJobLocation] = useState('Remote / Hybrid');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [jobSuccess, setJobSuccess] = useState(false);

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const [profileRes, menteesRes] = await Promise.all([
          api.get('/alumni/profile'),
          api.get('/alumni/mentorship-requests')
        ]);
        if (profileRes.status) setProfile(profileRes.data);
        if (menteesRes.status) setMentees(menteesRes.data);
      } catch (err) {
        console.error('Error fetching alumni data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumniData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/alumni/profile', profile);
      if (res.status) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alumni/jobs', {
        title: jobTitle,
        company_name: companyName,
        job_type: jobType,
        location: jobLocation,
        salary_range: jobSalary,
        description: jobDesc,
        requirements: jobReqs,
      });

      if (res.status) {
        setJobSuccess(true);
        setJobTitle('');
        setCompanyName('');
        setJobDesc('');
        setJobReqs('');
        setTimeout(() => setJobSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Error posting job');
    }
  };

  const handleMentorshipAction = async (id, status) => {
    try {
      await api.put(`/alumni/mentorship-requests/${id}`, { status });
      setMentees(mentees.map(m => m.id === id ? { ...m, status } : m));
    } catch (err) {
      alert('Action failed');
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
    <div className="alumni-dashboard py-4">
      <div className="container">
        {/* Welcome Header */}
        <div className="bg-primary text-white rounded-4 p-4 p-md-5 mb-4 shadow" style={{ background: 'var(--grad-hero)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
                <ShieldCheck size={16} />
                <span>OFFICIAL ALUMNI MEMBER PORTAL</span>
              </div>
              <h2 className="fw-bold mb-2">
                Welcome, {profile?.first_name} {profile?.last_name}!
              </h2>
              <p className="text-light text-opacity-85 mb-0">
                {profile?.current_designation || 'Alumni Member'} at {profile?.current_company || 'Industry'} • Batch {profile?.batch_year || 'AU'}
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button 
                onClick={() => setShowIdModal(true)} 
                className="btn btn-akal-yellow d-inline-flex align-items-center gap-2 shadow"
              >
                <CreditCard size={18} />
                <span>View Digital Alumni ID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="d-flex gap-2 border-bottom mb-4 pb-2">
          <button 
            className={`filter-chip ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} className="me-1" />
            My Profile & Privacy
          </button>
          <button 
            className={`filter-chip ${activeTab === 'mentorship' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentorship')}
          >
            <MessageSquare size={15} className="me-1" />
            Mentorship Inquiries ({mentees.filter(m => m.status === 'requested').length})
          </button>
          <button 
            className={`filter-chip ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase size={15} className="me-1" />
            Post Career Opportunity
          </button>
        </div>

        {/* TAB 1: Profile Editor */}
        {activeTab === 'profile' && profile && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="akal-card p-4">
                <h5 className="fw-bold mb-3 border-bottom pb-2">Edit Public Alumni Profile</h5>
                
                {saveSuccess && (
                  <div className="alert alert-success small py-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Profile changes saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">First Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.first_name || ''}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Last Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.last_name || ''}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Current Company / Organization</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.current_company || ''}
                        onChange={(e) => setProfile({ ...profile, current_company: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Current Designation / Role</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.current_designation || ''}
                        onChange={(e) => setProfile({ ...profile, current_designation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">City Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.location_city || ''}
                        onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Country</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={profile.location_country || 'India'}
                        onChange={(e) => setProfile({ ...profile, location_country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Skills / Expertise (Comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile.skills || ''}
                      onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Professional Bio</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">LinkedIn URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    />
                  </div>

                  {/* Mentorship Settings */}
                  <div className="p-3 bg-light rounded-3 mb-4 border">
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="mentorStatusCheck"
                        checked={Boolean(Number(profile.is_mentor))}
                        onChange={(e) => setProfile({ ...profile, is_mentor: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label fw-bold small text-dark" htmlFor="mentorStatusCheck">
                        ⭐ Active as a Career Mentor for Akal University Students
                      </label>
                    </div>

                    {Boolean(Number(profile.is_mentor)) && (
                      <div className="mt-2">
                        <label className="form-label small text-muted">Mentorship Topics (e.g. Cloud Architectures, Higher Studies Guidance, Resume Reviews)</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          value={profile.mentorship_topics || ''}
                          onChange={(e) => setProfile({ ...profile, mentorship_topics: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-akal-primary d-flex align-items-center gap-2">
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Profile Meta Card */}
            <div className="col-lg-4">
              <div className="akal-card p-4">
                <h6 className="fw-bold text-dark border-bottom pb-2">Academic Record</h6>
                <ul className="list-unstyled small d-flex flex-column gap-2 text-muted mb-4">
                  <li><strong>Degree:</strong> {profile.degree}</li>
                  <li><strong>Department:</strong> {profile.department}</li>
                  <li><strong>Batch:</strong> {profile.batch_year}</li>
                  <li><strong>Enrollment No:</strong> {profile.enrollment_no || 'AU-OFFICIAL'}</li>
                </ul>

                <div className="p-3 bg-light rounded-3 text-center border">
                  <div className="text-muted small mb-2">Digital ID Card Status</div>
                  <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                    ● ACTIVE & VERIFIED
                  </span>
                  <button onClick={() => setShowIdModal(true)} className="btn btn-akal-outline btn-sm w-100 mt-3">
                    Open Digital Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Mentorship Requests */}
        {activeTab === 'mentorship' && (
          <div className="akal-card p-4">
            <h5 className="fw-bold text-dark mb-3">Student Mentorship Inquiries</h5>
            
            {mentees.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <MessageSquare size={36} className="opacity-50 mb-2" />
                <p>No student inquiries at the moment. Your mentor profile is active in the directory.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>Student Mentee</th>
                      <th>Program & Year</th>
                      <th>Mentorship Topic</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {mentees.map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold">{req.mentee_first_name} {req.mentee_last_name}</td>
                        <td className="text-muted">{req.degree} (Year {req.current_year})</td>
                        <td className="fw-semibold text-primary">{req.topic}</td>
                        <td className="text-muted" style={{ maxWidth: '200px' }}>{req.message}</td>
                        <td>
                          <span className={`badge ${req.status === 'accepted' ? 'bg-success' : req.status === 'completed' ? 'bg-info' : 'bg-warning text-dark'}`}>
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {req.status === 'requested' ? (
                            <button 
                              onClick={() => handleMentorshipAction(req.id, 'accepted')} 
                              className="btn btn-sm btn-success py-0 px-2"
                            >
                              Accept
                            </button>
                          ) : req.status === 'accepted' ? (
                            <button 
                              onClick={() => handleMentorshipAction(req.id, 'completed')} 
                              className="btn btn-sm btn-primary py-0 px-2"
                            >
                              Mark Completed
                            </button>
                          ) : (
                            <span className="text-muted small">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Job Posting */}
        {activeTab === 'jobs' && (
          <div className="akal-card p-4" style={{ maxWidth: '750px' }}>
            <h5 className="fw-bold text-dark mb-3">Post Career Opportunity for Alumni & Students</h5>

            {jobSuccess && (
              <div className="alert alert-success small py-2 d-flex align-items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Opportunity published successfully to the career board!</span>
              </div>
            )}

            <form onSubmit={handlePostJob}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Job / Role Title *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Associate Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Company / Organization *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Microsoft / Startup"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Job Type</label>
                  <select 
                    className="form-select"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                    <option value="part_time">Part-Time</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Salary / Stipend Range</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. ₹8-12 LPA"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Job Description</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Outline key responsibilities, teams, and day-to-day focus..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Skills & Requirements</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Key technical skills, qualifications, or experience required..."
                  value={jobReqs}
                  onChange={(e) => setJobReqs(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-akal-primary d-flex align-items-center gap-2">
                <PlusCircle size={16} />
                <span>Publish Opportunity</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Digital ID Modal */}
      {showIdModal && (
        <DigitalIdModal onClose={() => setShowIdModal(false)} />
      )}
    </div>
  );
};

export default AlumniDashboard;
