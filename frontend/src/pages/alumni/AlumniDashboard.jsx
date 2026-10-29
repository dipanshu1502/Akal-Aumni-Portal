import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DigitalIdModal from '../../components/common/DigitalIdModal';
import { DEPARTMENTS } from '../../constants/departments';
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
  GraduationCap,
  Download
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
  const [myJobs, setMyJobs] = useState([]);
  const [jobApplicantsView, setJobApplicantsView] = useState(null);
  const [jobApplicantsLoading, setJobApplicantsLoading] = useState(false);
  const [jobApplicantsError, setJobApplicantsError] = useState('');

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const [profileRes, menteesRes, jobsRes] = await Promise.all([
          api.get('/alumni/profile'),
          api.get('/alumni/mentorship-requests'),
          api.get('/alumni/jobs')
        ]);
        if (profileRes.status) setProfile(profileRes.data);
        if (menteesRes.status) setMentees(menteesRes.data);
        if (jobsRes.status) setMyJobs(jobsRes.data || []);
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
        try {
          const jobsRes = await api.get('/alumni/jobs');
          if (jobsRes.status) setMyJobs(jobsRes.data || []);
        } catch (refreshError) {
          console.error('Job was submitted, but the list could not be refreshed:', refreshError);
        }
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

  const openJobApplicants = async (job) => {
    setJobApplicantsView({ job, applicants: [] });
    setJobApplicantsLoading(true);
    setJobApplicantsError('');
    try {
      const response = await api.get(`/alumni/jobs/${job.id}/applications`);
      if (!response.status) throw new Error(response.message || 'Could not load applicants');
      setJobApplicantsView(response.data);
    } catch (error) {
      setJobApplicantsError(error.message || 'Could not load applicants.');
    } finally {
      setJobApplicantsLoading(false);
    }
  };

  const downloadJobApplicants = () => {
    const applicants = jobApplicantsView?.applicants || [];
    const columns = [['sr_no', 'Sr. No.'], ['uid', 'UID'], ['name', 'Name'], ['contact_number', 'Contact Number'], ['member_type', 'Alumni / Student'], ['email', 'Email'], ['applied_at', 'Applied At']];
    const escapeCsv = (value) => {
      const text = String(value ?? '');
      const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [columns.map(([, label]) => escapeCsv(label)).join(','), ...applicants.map((row, index) => columns.map(([key]) => escapeCsv(key === 'sr_no' ? index + 1 : row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(jobApplicantsView?.job?.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-applicants.csv`;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadMentorshipRequests = () => {
    const columns = [['sr_no', 'Sr. No.'], ['enrollment_no', 'Student UID'], ['mentee_first_name', 'First Name'], ['mentee_last_name', 'Last Name'], ['mentee_email', 'Email'], ['mentee_phone', 'Contact Number'], ['department', 'Department'], ['degree', 'Program'], ['current_year', 'Year'], ['semester', 'Semester'], ['topic', 'Topic'], ['message', 'Message'], ['status', 'Status'], ['requested_at', 'Requested At']];
    const escapeCsv = (value) => {
      const text = String(value ?? '');
      const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [columns.map(([, label]) => escapeCsv(label)).join(','), ...mentees.map((row, index) => columns.map(([key]) => escapeCsv(key === 'sr_no' ? index + 1 : row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentorship-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleMentorshipAction = async (id, status) => {
    try {
      await api.put(`/alumni/mentorship-requests/${id}`, { status });
      setMentees(mentees.map(m => m.id === id ? { ...m, status } : m));
    } catch (err) {
      alert('Action failed');
    }
  };

  // Dashboard DP change -> resize karke base64 banaye
  const handleDpChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 512;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        setProfile((p) => ({ ...p, profile_photo: c.toDataURL('image/jpeg', 0.82) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard py-4 bg-white min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm" style={{ backgroundColor: 'var(--akal-navy)', borderBottom: '3px solid var(--akal-yellow)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
                <ShieldCheck size={16} />
                <span>OFFICIAL ALUMNI MEMBER PORTAL</span>
              </div>
              <h2 className="fw-bold mb-2 text-white">
                Welcome, {profile?.first_name} {profile?.last_name}!
              </h2>
              <p className="text-white-50 mb-0">
                {profile?.current_designation || 'Alumni Member'} at {profile?.current_company || 'Industry'} • Batch {profile?.batch_year || 'AU'}
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button 
                onClick={() => setShowIdModal(true)} 
                className="btn btn-akal-yellow d-inline-flex align-items-center gap-2 shadow-sm"
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
                  <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3 border">
                    {profile.profile_photo ? (
                      <img src={profile.profile_photo} alt="DP"
                        className="rounded-circle" style={{ width: '72px', height: '72px', objectFit: 'cover' }} />
                    ) : (
                      <div className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: '72px', height: '72px', fontSize: '24px' }}>
                        {profile.first_name?.[0]}{profile.last_name?.[0] || ''}
                      </div>
                    )}
                    <div>
                      <div className="fw-bold small">Profile Photo (DP)</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Shown on your DP and Digital ID Card</div>
                      <label className="btn btn-sm btn-outline-primary rounded-pill mt-1 mb-0" style={{ cursor: 'pointer' }}>
                        Change Photo
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={(e) => handleDpChange(e.target.files?.[0])} />
                      </label>
                      {profile.profile_photo && (
                        <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none ms-1"
                          onClick={() => setProfile({ ...profile, profile_photo: '' })}>Remove</button>
                      )}
                    </div>
                    <div className="ms-auto text-end small">
                      <div className="text-muted">AUID</div>
                      <div className="font-monospace fw-bold">{profile.auid || '—'}</div>
                      <div className="text-muted mt-1">Alumni ID</div>
                      <div className="font-monospace fw-bold text-primary">{profile.alumni_id || '—'}</div>
                    </div>
                  </div>
                  {/* Basic info */}
                  <div className="fw-bold small text-primary mb-2">Basic Information</div>
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
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Alternate Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profile.alt_email || ''}
                        onChange={(e) => setProfile({ ...profile, alt_email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Professional info */}
                  <div className="fw-bold small text-primary mb-2">Professional Information</div>
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
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Industry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.industry || ''}
                        onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={profile.experience_years ?? ''}
                        onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
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

                  {/* Social links — saare URL fields */}
                  <div className="fw-bold small text-primary mb-2">Social Links</div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">GitHub URL</label>
                      <input type="text" className="form-control"
                        value={profile.github_url || ''}
                        onChange={(e) => setProfile({ ...profile, github_url: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Twitter / X URL</label>
                      <input type="text" className="form-control"
                        value={profile.twitter_url || ''}
                        onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Website URL</label>
                      <input type="text" className="form-control"
                        value={profile.website_url || ''}
                        onChange={(e) => setProfile({ ...profile, website_url: e.target.value })} />
                    </div>
                  </div>

                  {/* Privacy settings */}
                  <div className="fw-bold small text-primary mb-2">Privacy Settings</div>
                  <div className="p-3 bg-light rounded-3 mb-3 border d-flex flex-column gap-2">
                    {[
                      { key: 'is_public_profile', label: 'Show my profile in public alumni directory' },
                      { key: 'show_email_public', label: 'Show my email publicly' },
                      { key: 'show_phone_public', label: 'Show my phone publicly' },
                    ].map((opt) => (
                      <div className="form-check" key={opt.key}>
                        <input className="form-check-input" type="checkbox" id={`privacy-${opt.key}`}
                          checked={Boolean(Number(profile[opt.key]))}
                          onChange={(e) => setProfile({ ...profile, [opt.key]: e.target.checked ? 1 : 0 })} />
                        <label className="form-check-label small fw-bold" htmlFor={`privacy-${opt.key}`}>{opt.label}</label>
                      </div>
                    ))}
                  </div>

                  {/* Academic record — table ke saare academic fields */}
                  <div className="fw-bold small text-primary mb-2">Academic Record</div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Enrollment No</label>
                      <input type="text" className="form-control"
                        value={profile.enrollment_no || ''}
                        onChange={(e) => setProfile({ ...profile, enrollment_no: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Batch Year</label>
                      <input type="text" className="form-control" placeholder="e.g. 2016-2020"
                        value={profile.batch_year || ''}
                        onChange={(e) => setProfile({ ...profile, batch_year: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Degree</label>
                      <input type="text" className="form-control"
                        value={profile.degree || ''}
                        onChange={(e) => setProfile({ ...profile, degree: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Department</label>
                      <select className="form-select"
                        value={profile.department || ''}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}>
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Graduation Year</label>
                      <input type="number" min="1950" max="2100" className="form-control"
                        value={profile.graduation_year ?? ''}
                        onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })} />
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <div className="fw-bold small mb-2">What are you currently doing?</div>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {['higher_study', 'job', 'other'].map((s) => (
                        <button key={s} type="button" onClick={() => setProfile({ ...profile, current_status: s })}
                          className={`btn btn-sm rounded-pill fw-bold px-3 ${profile.current_status === s ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                          {s === 'higher_study' ? 'Higher Study' : s === 'job' ? 'Job' : 'Other'}
                        </button>
                      ))}
                    </div>
                    {profile.current_status === 'higher_study' && (
                      <div className="row g-2">
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="Institution"
                            value={profile.study_institution || ''} onChange={(e) => setProfile({ ...profile, study_institution: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="Course"
                            value={profile.study_course || ''} onChange={(e) => setProfile({ ...profile, study_course: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="City"
                            value={profile.study_location || ''} onChange={(e) => setProfile({ ...profile, study_location: e.target.value })} />
                        </div>
                      </div>
                    )}
                    {profile.current_status === 'job' && (
                      <div>
                        <div className="d-flex gap-2 mb-2">
                          {['private', 'government'].map((t) => (
                            <button key={t} type="button" onClick={() => setProfile({ ...profile, job_type: t })}
                              className={`btn btn-sm rounded-pill fw-bold px-3 ${profile.job_type === t ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                              {t === 'private' ? 'Private' : 'Government'}
                            </button>
                          ))}
                        </div>
                        <div className="row g-2">
                          <div className="col-md-4">
                            <input type="text" className="form-control form-control-sm" placeholder="Organization"
                              value={profile.job_organization || ''} onChange={(e) => setProfile({ ...profile, job_organization: e.target.value, current_company: e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <input type="text" className="form-control form-control-sm" placeholder="Designation"
                              value={profile.job_designation || ''} onChange={(e) => setProfile({ ...profile, job_designation: e.target.value, current_designation: e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <input type="text" className="form-control form-control-sm" placeholder="City"
                              value={profile.job_location || ''} onChange={(e) => setProfile({ ...profile, job_location: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}
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
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 className="fw-bold text-dark mb-0">Student Mentorship Inquiries</h5>
              <button type="button" className="btn btn-sm btn-akal-primary d-inline-flex align-items-center gap-2" onClick={downloadMentorshipRequests} disabled={mentees.length === 0}><Download size={15} /> Download CSV</button>
            </div>
            
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
                      <th>Contact & ID</th>
                      <th>Department / Program</th>
                      <th>Mentorship Topic</th>
                      <th>Message</th>
                      <th>Requested At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {mentees.map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold">{req.mentee_first_name} {req.mentee_last_name}</td>
                        <td>{req.mentee_email}<div className="text-muted">{req.mentee_phone || 'No phone'} · {req.enrollment_no || 'No UID'}</div></td>
                        <td className="text-muted">{req.department || '—'}<div>{req.degree || '—'} · Year {req.current_year || '—'} / Sem {req.semester || '—'}</div></td>
                        <td className="fw-semibold text-primary">{req.topic}</td>
                        <td className="text-muted" style={{ maxWidth: '240px', whiteSpace: 'pre-wrap' }}>{req.message || 'No message provided'}</td>
                        <td>{req.requested_at ? new Date(req.requested_at).toLocaleString() : '—'}</td>
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
          <div className="row g-4 align-items-start">
          <div className="col-lg-7"><div className="akal-card p-4">
            <h5 className="fw-bold text-dark mb-3">Post Career Opportunity for Alumni & Students</h5>

            {jobSuccess && (
              <div className="alert alert-success small py-2 d-flex align-items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Opportunity submitted for review. It will appear on the career board after Admin or Super Admin approval.</span>
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
                <span>Submit for Approval</span>
              </button>
            </form>
          </div></div>
          <div className="col-lg-5">
            <div className="akal-card p-4">
              <h5 className="fw-bold text-dark mb-3">My Job Posts & Applicants</h5>
              {myJobs.length === 0 ? <p className="text-muted mb-0">You have not posted any jobs yet.</p> : (
                <div className="d-flex flex-column gap-2">
                  {myJobs.map((job) => (
                    <div key={job.id} className="border rounded-3 p-3">
                      <div className="d-flex justify-content-between gap-2 align-items-start">
                        <div><div className="fw-bold">{job.title}</div><div className="small text-muted">{job.company_name}</div></div>
                        <span className={`badge ${job.status === 'approved' ? 'bg-success' : job.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{job.status}</span>
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => openJobApplicants(job)}>
                        View applicants ({Number(job.application_count || 0)})
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {jobApplicantsView && (
                <div className="border rounded-3 p-3 mt-3">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div><div className="fw-bold">{jobApplicantsView.job.title}</div><div className="small text-muted">{jobApplicantsView.applicants.length} applicants</div></div>
                    <button type="button" className="btn-close" aria-label="Close applicants" onClick={() => setJobApplicantsView(null)} />
                  </div>
                  {jobApplicantsLoading ? <div className="small text-muted">Loading applicants...</div>
                    : jobApplicantsError ? <div className="small text-danger">{jobApplicantsError}</div>
                      : jobApplicantsView.applicants.length === 0 ? <div className="small text-muted">No applications received yet.</div>
                        : <div className="table-responsive"><table className="table table-sm align-middle mb-2"><thead><tr><th>Name</th><th>Type</th><th>Email</th><th>Applied</th></tr></thead><tbody>
                          {jobApplicantsView.applicants.map((applicant) => <tr key={applicant.id}><td>{applicant.name}<div className="small text-muted">{applicant.uid || '—'}</div></td><td>{applicant.member_type}</td><td>{applicant.email}</td><td>{applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : '—'}</td></tr>)}
                        </tbody></table></div>}
                  <button type="button" className="btn btn-sm btn-akal-primary" onClick={downloadJobApplicants} disabled={jobApplicantsLoading || !!jobApplicantsError || jobApplicantsView.applicants.length === 0}>Download CSV</button>
                </div>
              )}
            </div>
          </div>
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
