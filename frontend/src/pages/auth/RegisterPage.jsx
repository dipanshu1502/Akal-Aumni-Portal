import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, ShieldCheck, GraduationCap, AlertCircle, CheckCircle2, Plus, Trash2, BookOpen, Camera, Briefcase, Building2, Landmark, Clock, LogIn } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Mathematics & Computing',
  'Botany & Biotechnology',
  'Physics',
  'Chemistry',
  'Commerce & Management',
  'Psychology & Humanities',
];

const EDUCATION_LEVELS = [
  { value: 'UG', label: "UG — Undergraduate (Bachelor's)" },
  { value: 'PG', label: "PG — Postgraduate (Master's)" },
  { value: 'PhD', label: 'PhD — Doctorate' },
  { value: 'Diploma', label: 'Diploma / Certificate' },
  { value: 'Other', label: 'Other' },
];

// PhD > PG > UG > Diploma > Other — the highest degree becomes the primary profile degree
const LEVEL_PRIORITY = { PhD: 4, PG: 3, UG: 2, Diploma: 1, Other: 0 };

const DEGREE_PLACEHOLDERS = {
  UG: 'e.g. B.Tech / B.Sc / B.Com / BA',
  PG: 'e.g. M.Tech / M.Sc / M.Com / MBA',
  PhD: 'e.g. Ph.D. in Computer Science',
  Diploma: 'e.g. PG Diploma in Data Science',
  Other: 'e.g. Certificate Programme',
};

const createEducation = (role = 'alumni') => ({
  education_level: 'UG',
  degree_name: '',
  department: DEPARTMENTS[0],
  specialization: '',
  enrollment_no: '',
  start_year: '',
  end_year: '',
  status: role === 'student' ? 'ongoing' : 'completed',
  grade: '',
  research_title: '',
});

const isBlankEducation = (edu) =>
  !edu.degree_name.trim() &&
  !edu.specialization.trim() &&
  !edu.enrollment_no.trim() &&
  !String(edu.start_year).trim() &&
  !String(edu.end_year).trim();

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('alumni'); // 'alumni' or 'student'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educations, setEducations] = useState([createEducation('alumni')]);
  // 1. DP photo (base64 data-url)
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);
  // 2. AUID — 9 digit unique
  const [auid, setAuid] = useState('');
  // 3. Current status — higher_study / job / other + conditional details
  const [currentStatus, setCurrentStatus] = useState('');
  const [studyInstitution, setStudyInstitution] = useState('');
  const [studyCourse, setStudyCourse] = useState('');
  const [studyLocation, setStudyLocation] = useState('');
  const [jobType, setJobType] = useState(''); // private / government
  const [jobOrganization, setJobOrganization] = useState('');
  const [jobDesignation, setJobDesignation] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  // Other status -> generic company/designation (only visible when status is "Other")
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  // Remaining profile fields (also stored in DB: phone, city, country, bio, skills, linkedin)
  const [phone, setPhone] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('India');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isMentor, setIsMentor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  // Alumni registration ke baad "admin approval pending" screen dikhane ke liye
  const [pendingRequest, setPendingRequest] = useState(null);

  // Switching Alumni <-> Student tab resets only the untouched (blank) education rows
  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setEducations((prev) => {
      const kept = prev.filter((edu) => !isBlankEducation(edu));
      return kept.length > 0 ? kept : [createEducation(nextRole)];
    });
  };

  const updateEducation = (index, field, value) => {
    setEducations((prev) => prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)));
  };

  const addEducation = () => setEducations((prev) => [...prev, createEducation(role)]);

  const removeEducation = (index) => {
    setEducations((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  // DP photo -> resize karke base64 data-url banaye (max ~2MB, 512px)
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setPhotoError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setPhotoError('Please choose a JPG / PNG / WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 512;
        let { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        if (dataUrl.length > 2800000) {
          setPhotoError('Photo is too large after resize. Please choose a smaller image.');
          return;
        }
        setProfilePhoto(dataUrl);
      };
      img.onerror = () => setPhotoError('Could not read this image. Please try another photo.');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // --- AUID validation (alumni ke liye mandatory, 9 digit) ---
    if (role === 'alumni') {
      if (!/^[0-9]{9}$/.test(auid.trim())) {
        setErrorMsg('AUID must be exactly 9 digits (e.g. 202401234). Alumni ID is created as AUAA + AUID.');
        setLoading(false);
        return;
      }
      // --- Current status validation ---
      if (!['higher_study', 'job', 'other'].includes(currentStatus)) {
        setErrorMsg('Please select what you are currently doing — Higher Study / Job / Other.');
        setLoading(false);
        return;
      }
      if (currentStatus === 'higher_study' && !studyInstitution.trim()) {
        setErrorMsg('Please enter where you are doing higher studies (institution / university name).');
        setLoading(false);
        return;
      }
      if (currentStatus === 'job') {
        if (!['private', 'government'].includes(jobType)) {
          setErrorMsg('Please select Private or Government job.');
          setLoading(false);
          return;
        }
        if (!jobOrganization.trim()) {
          setErrorMsg('Please enter your job organization / company name.');
          setLoading(false);
          return;
        }
      }
    }

    // --- Validate every Akal University education entry (UG / PG / PhD ...) ---
    if (educations.length === 0) {
      setErrorMsg('Please add at least one education detail from Akal University.');
      setLoading(false);
      return;
    }

    for (let i = 0; i < educations.length; i++) {
      const ref = `Education ${i + 1}`;
      const edu = educations[i];
      const start = parseInt(edu.start_year, 10);
      const end = parseInt(edu.end_year, 10);

      if (!edu.degree_name.trim()) {
        setErrorMsg(`${ref}: degree / programme name is required.`);
        setLoading(false);
        return;
      }
      if (!edu.department.trim()) {
        setErrorMsg(`${ref}: department / discipline is required.`);
        setLoading(false);
        return;
      }
      if (!start || start < 1950 || start > 2100) {
        setErrorMsg(`${ref}: starting year is required (e.g. 2020).`);
        setLoading(false);
        return;
      }
      if (edu.status === 'completed' && (!end || end < 1950 || end > 2100)) {
        setErrorMsg(`${ref}: completion year is required for completed courses.`);
        setLoading(false);
        return;
      }
      if (start && end && end < start) {
        setErrorMsg(`${ref}: completion year cannot be before the starting year.`);
        setLoading(false);
        return;
      }
    }

    // Highest degree becomes the primary degree on the alumni/student profile
    const primary = educations.reduce(
      (best, edu) =>
        (LEVEL_PRIORITY[edu.education_level] ?? 0) > (LEVEL_PRIORITY[best.education_level] ?? 0) ? edu : best,
      educations[0]
    );

    const primaryStart = parseInt(primary.start_year, 10);
    const primaryEnd = parseInt(primary.end_year, 10);

    const formData = {
      role,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      auid: role === 'alumni' ? auid.trim() : undefined,
      profile_photo: profilePhoto || undefined,
      current_status: role === 'alumni' ? currentStatus : undefined,
      // Higher study details
      study_institution: studyInstitution,
      study_course: studyCourse,
      study_location: studyLocation,
      // Job details (private / government)
      job_type: jobType || undefined,
      job_organization: jobOrganization,
      job_designation: jobDesignation,
      job_location: jobLocation,
      enrollment_no: primary.enrollment_no.trim(),
      degree: primary.degree_name.trim(),
      department: primary.department,
      batch_year: primaryEnd ? `${primaryStart}-${primaryEnd}` : `${primaryStart}-Pursuing`,
      // "Other" status uses generic fields; job/highestudy sync into company/designation via backend
      current_company: currentStatus === 'other' ? currentCompany : (currentStatus === 'job' ? jobOrganization : ''),
      current_designation: currentStatus === 'other' ? currentDesignation : (currentStatus === 'job' ? jobDesignation : ''),
      phone,
      location_city: locationCity,
      location_country: locationCountry,
      bio,
      skills,
      linkedin_url: linkedinUrl,
      is_mentor: isMentor ? 1 : 0,
      // Every degree/programme (UG, PG, PhD, ...) done at Akal University
      educations: educations.map((edu) => ({
        education_level: edu.education_level,
        degree_name: edu.degree_name.trim(),
        department: edu.department,
        specialization: edu.specialization.trim(),
        enrollment_no: edu.enrollment_no.trim(),
        start_year: parseInt(edu.start_year, 10),
        end_year: parseInt(edu.end_year, 10) || null,
        status: edu.status,
        grade: edu.grade.trim(),
        research_title: edu.research_title.trim(),
      })),
    };

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      // Alumni: request admins ke paas chali gayi — account sirf approve hone par banega
      if (res.pending) {
        setPendingRequest({ email, firstName, lastName });
        return;
      }
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (role === 'alumni') navigate('/alumni/dashboard');
        else navigate('/student/dashboard');
      }, 1500);
    } else {
      const errorList = res.errors ? (Array.isArray(res.errors) ? res.errors : Object.values(res.errors)) : [];
      const firstError = errorList.length > 0 ? String(errorList[0]) : '';
      setErrorMsg(
        firstError && res.message && !res.message.includes(firstError)
          ? `${res.message} ${firstError}`
          : res.message || firstError || 'Registration failed'
      );
    }
  };

  // Alumni registration submitted — sirf tab tak pending jab tak admin approve na kare
  if (pendingRequest) {
    const steps = [
      {
        title: 'Request Received',
        text: 'Your details are now in the admin verification queue.',
        done: true,
      },
      {
        title: 'Admin Verification',
        text: 'An administrator reviews your AUID and education details.',
        done: false,
      },
      {
        title: 'Account Activated',
        text: 'Login, alumni dashboard and digital ID card are enabled.',
        done: false,
      },
    ];

    return (
      <div className="register-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white rounded-4 shadow-lg border p-4 p-md-5 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-25 mb-3"
                  style={{ width: '76px', height: '76px' }}
                >
                  <Clock size={34} className="text-warning" />
                </div>

                <h4 className="fw-bold text-dark mb-2">Registration Request Sent for Approval!</h4>
                <p className="text-muted mb-1">
                  Thank you{' '}
                  <span className="fw-bold text-dark">
                    {pendingRequest.firstName}
                    {pendingRequest.lastName ? ` ${pendingRequest.lastName}` : ''}
                  </span>
                  !
                </p>
                <p className="text-muted small mb-4" style={{ maxWidth: '560px', margin: '0 auto' }}>
                  Your alumni registration request has been sent to the{' '}
                  <strong>Akal University Admin Team</strong>. Your alumni account will be{' '}
                  <strong>created and activated only after an administrator approves</strong> your request.
                </p>

                <div className="text-start mx-auto mb-4" style={{ maxWidth: '480px' }}>
                  {steps.map((step, i) => (
                    <div className="d-flex gap-3 mb-3" key={i}>
                      <span
                        className={`badge rounded-pill px-3 py-2 align-self-start ${
                          step.done ? 'bg-success' : 'bg-light border text-muted'
                        }`}
                        style={{ minWidth: '34px' }}
                      >
                        {step.done ? <CheckCircle2 size={14} /> : i + 1}
                      </span>
                      <div>
                        <div className="fw-bold small text-dark">{step.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {step.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-light border small text-start mb-4">
                  <div className="d-flex gap-2">
                    <AlertCircle size={16} className="text-warning mt-1" />
                    <div>
                      Until your request is approved you <strong>cannot log in</strong> with{' '}
                      <span className="fw-bold">{pendingRequest.email}</span>. After approval, sign in to access your
                      alumni dashboard and digital ID card.
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Link to="/login" className="btn btn-akal-yellow px-4 fw-bold d-flex align-items-center justify-content-center gap-1">
                    <LogIn size={16} />
                    <span>Go to Login</span>
                  </Link>
                  <Link to="/" className="btn btn-outline-dark px-4 fw-bold">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-lg border p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="university-crest mx-auto mb-2" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                  AU
                </div>
                <h3 className="fw-bold text-dark mb-1">Join the Akal Alumni Network</h3>
                <p className="text-muted small">
                  Create your official profile to receive your digital alumni card, batch connectivity, and career mentorship.
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="d-flex justify-content-center gap-2 mb-4">
                <button
                  type="button"
                  className={`btn px-4 py-2 rounded-pill fw-bold ${role === 'alumni' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}
                  onClick={() => handleRoleChange('alumni')}
                >
                  <ShieldCheck size={16} className="me-1" />
                  Alumni Registration
                </button>
                <button
                  type="button"
                  className={`btn px-4 py-2 rounded-pill fw-bold ${role === 'student' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}
                  onClick={() => handleRoleChange('student')}
                >
                  <GraduationCap size={16} className="me-1" />
                  Current Student Registration
                </button>
              </div>

              {errorMsg && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* 1. DP Photo upload — DP + Digital card dono me dikhegi */}
                <div className="border rounded-3 p-3 mb-4 bg-light">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden border bg-white"
                      style={{ width: '88px', height: '88px', cursor: 'pointer', borderWidth: '2px' }}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      title="Click to upload profile photo"
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Camera size={30} className="text-muted" />
                      )}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: '220px' }}>
                      <div className="fw-bold small">Profile Photo (DP) *</div>
                      <div className="text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                        This photo will appear as your profile picture and on your Digital Alumni Card. JPG / PNG, max 5MB.
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                          <Camera size={14} className="me-1" /> {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {profilePhoto && (
                          <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setProfilePhoto('')}>
                            Remove
                          </button>
                        )}
                      </div>
                      {photoError && <div className="text-danger small mt-1">{photoError}</div>}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="d-none" onChange={handlePhotoChange} />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gurleen"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kaur"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 2. AUID (9 digit unique) — Alumni ID = AUAA + AUID */}
                {role === 'alumni' && (
                  <div className="border rounded-3 p-3 mb-4 bg-light">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">AUID (9-digit University ID) *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          className="form-control font-monospace fw-bold"
                          placeholder="e.g. 202401234"
                          value={auid}
                          onChange={(e) => setAuid(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          required
                        />
                        <div className="form-text">Exactly 9 digits. Must be unique.</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Your Alumni ID (auto-generated)</label>
                        <div className="form-control bg-white font-monospace fw-bold text-primary">
                          {auid.length === 9 ? `AUAA${auid}` : 'Type 9 digits above to generate Alumni ID'}
                        </div>
                        <div className="form-text">Alumni ID is created by combining AUAA with your AUID.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education at Akal University — UG, PG, PhD ... (all must be filled) */}
                <div className="border rounded-3 p-3 mb-4 bg-light">
                  <div className="d-flex align-items-start gap-2 mb-1">
                    <BookOpen size={18} className="text-primary mt-1" />
                    <div>
                      <div className="fw-bold small">Education at Akal University *</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Add <strong>every</strong> programme you have completed or are pursuing at Akal University — UG, PG, PhD, Diploma, etc.
                      </div>
                    </div>
                  </div>

                  {educations.map((edu, index) => (
                    <div key={index} className="bg-white border rounded-3 p-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold small text-primary">
                          Education {index + 1}
                          <span className="text-muted fw-normal ms-2">
                            ({(EDUCATION_LEVELS.find((l) => l.value === edu.education_level)?.label || '').split('—')[0].trim()})
                          </span>
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          disabled={educations.length === 1}
                          onClick={() => removeEducation(index)}
                          title={educations.length === 1 ? 'At least one education entry is required' : 'Remove this education'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Education Level *</label>
                          <select
                            className="form-select"
                            value={edu.education_level}
                            onChange={(e) => updateEducation(index, 'education_level', e.target.value)}
                          >
                            {EDUCATION_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Degree / Programme *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={DEGREE_PLACEHOLDERS[edu.education_level] || DEGREE_PLACEHOLDERS.Other}
                            value={edu.degree_name}
                            onChange={(e) => updateEducation(index, 'degree_name', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Department / Discipline *</label>
                          <select
                            className="form-select"
                            value={edu.department}
                            onChange={(e) => updateEducation(index, 'department', e.target.value)}
                          >
                            {DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Specialization / Major</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Cloud Computing, Organic Chemistry"
                            value={edu.specialization}
                            onChange={(e) => updateEducation(index, 'specialization', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Enrollment / Roll Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. AU-2020-0452"
                            value={edu.enrollment_no}
                            onChange={(e) => updateEducation(index, 'enrollment_no', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">From Year *</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="e.g. 2020"
                            min="1950"
                            max="2100"
                            value={edu.start_year}
                            onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">
                            {edu.status === 'ongoing' ? 'Expected Year' : 'Pass-out Year'} *
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={edu.status === 'ongoing' ? 'e.g. 2027' : 'e.g. 2024'}
                            min="1950"
                            max="2100"
                            value={edu.end_year}
                            onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                            required={edu.status === 'completed'}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-bold">Status *</label>
                          <select
                            className="form-select"
                            value={edu.status}
                            onChange={(e) => updateEducation(index, 'status', e.target.value)}
                          >
                            <option value="completed">Completed</option>
                            <option value="ongoing">Pursuing</option>
                          </select>
                        </div>
                      </div>

                      <div className="row g-3 mt-1">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">CGPA / Percentage</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 8.4 CGPA / 78%"
                            value={edu.grade}
                            onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                          />
                        </div>
                        {edu.education_level === 'PhD' && (
                          <div className="col-md-8">
                            <label className="form-label small fw-bold">Thesis / Research Title</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Quantum Photonics in Semiconductor Materials"
                              value={edu.research_title}
                              onChange={(e) => updateEducation(index, 'research_title', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill fw-bold mt-3"
                    onClick={addEducation}
                  >
                    <Plus size={14} className="me-1" />
                    Add another degree (UG / PG / PhD)
                  </button>
                </div>

                {role === 'alumni' && (
                  <>
                    <div className="border rounded-3 p-3 mb-3 bg-light">
                      <div className="fw-bold small mb-2">What are you currently doing? *</div>
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" onClick={() => setCurrentStatus('higher_study')}
                          className={`btn btn-sm rounded-pill fw-bold px-3 ${currentStatus === 'higher_study' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                          Higher Study
                        </button>
                        <button type="button" onClick={() => setCurrentStatus('job')}
                          className={`btn btn-sm rounded-pill fw-bold px-3 ${currentStatus === 'job' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                          Job
                        </button>
                        <button type="button" onClick={() => setCurrentStatus('other')}
                          className={`btn btn-sm rounded-pill fw-bold px-3 ${currentStatus === 'other' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                          Other
                        </button>
                      </div>
                    </div>

                    {currentStatus === 'higher_study' && (
                      <div className="bg-light border rounded-3 p-3 mb-3">
                        <div className="fw-bold small mb-2 text-primary">Higher Study Details</div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Institution / University *</label>
                            <input type="text" className="form-control" placeholder="e.g. IIT Delhi"
                              value={studyInstitution} onChange={(e) => setStudyInstitution(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Course / Programme</label>
                            <input type="text" className="form-control" placeholder="e.g. M.Tech CSE"
                              value={studyCourse} onChange={(e) => setStudyCourse(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Study City</label>
                            <input type="text" className="form-control" placeholder="e.g. New Delhi"
                              value={studyLocation} onChange={(e) => setStudyLocation(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStatus === 'job' && (
                      <div className="bg-light border rounded-3 p-3 mb-3">
                        <div className="fw-bold small mb-2 text-primary">Job Details</div>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <button type="button" onClick={() => setJobType('private')}
                            className={`btn btn-sm rounded-pill fw-bold px-3 ${jobType === 'private' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                            Private Job
                          </button>
                          <button type="button" onClick={() => setJobType('government')}
                            className={`btn btn-sm rounded-pill fw-bold px-3 ${jobType === 'government' ? 'btn-akal-primary' : 'btn-light border text-muted'}`}>
                            Government Job
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Organization *</label>
                            <input type="text" className="form-control" placeholder="e.g. TCS / Punjab Govt"
                              value={jobOrganization} onChange={(e) => setJobOrganization(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Designation</label>
                            <input type="text" className="form-control" placeholder="e.g. SDE / Clerk"
                              value={jobDesignation} onChange={(e) => setJobDesignation(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Job City</label>
                            <input type="text" className="form-control" placeholder="e.g. Bengaluru"
                              value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStatus === 'other' && (
                      <div className="bg-light border rounded-3 p-3 mb-3">
                        <div className="fw-bold small mb-2 text-primary">Current Details</div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Current Company / Organization</label>
                            <input type="text" className="form-control" placeholder="e.g. Freelance / Startup"
                              value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Designation / Role</label>
                            <input type="text" className="form-control" placeholder="e.g. Founder"
                              value={currentDesignation} onChange={(e) => setCurrentDesignation(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact & profile fields — saved in alumni_profiles table */}
                    <div className="border rounded-3 p-3 mb-3">
                      <div className="fw-bold small mb-2">Contact & Profile Details</div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Phone</label>
                          <input type="text" className="form-control" placeholder="e.g. 98765 43210"
                            value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">City</label>
                          <input type="text" className="form-control" placeholder="e.g. Bathinda"
                            value={locationCity} onChange={(e) => setLocationCity(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Country</label>
                          <input type="text" className="form-control" placeholder="India"
                            value={locationCountry} onChange={(e) => setLocationCountry(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-3 p-3 mb-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Skills (comma separated)</label>
                          <input type="text" className="form-control" placeholder="e.g. Java, React"
                            value={skills} onChange={(e) => setSkills(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">LinkedIn URL</label>
                          <input type="text" className="form-control" placeholder="https://linkedin.com/in/you"
                            value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Short Bio</label>
                          <textarea className="form-control" rows="2" placeholder="Briefly about yourself..."
                            value={bio} onChange={(e) => setBio(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="form-check p-3 bg-light rounded-3 mb-4 border">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        id="mentorCheck"
                        checked={isMentor}
                        onChange={(e) => setIsMentor(e.target.checked)}
                      />
                      <label className="form-check-label small fw-bold text-dark" htmlFor="mentorCheck">
                        ⭐ Volunteer as an Alumni Career Mentor for current students
                      </label>
                      <div className="text-muted small ms-4">
                        Offer guidance on career transitions, internships, and interview preparations.
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-akal-yellow w-100 justify-content-center py-2 fs-6 mb-3"
                >
                  <UserPlus size={18} />
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                </button>
              </form>

              <div className="text-center pt-3 border-top small text-muted">
                Already registered?{' '}
                <Link to="/login" className="fw-bold text-primary text-decoration-none">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
