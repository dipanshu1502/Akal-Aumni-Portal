import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, ShieldCheck, GraduationCap, AlertCircle, CheckCircle2, Plus, Trash2, BookOpen } from 'lucide-react';

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
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [isMentor, setIsMentor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

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
      enrollment_no: primary.enrollment_no.trim(),
      degree: primary.degree_name.trim(),
      department: primary.department,
      batch_year: primaryEnd ? `${primaryStart}-${primaryEnd}` : `${primaryStart}-Pursuing`,
      current_company: currentCompany,
      current_designation: currentDesignation,
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
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Current Company / Organization</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Google / Microsoft / TCS"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Designation / Role</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Software Engineer"
                          value={currentDesignation}
                          onChange={(e) => setCurrentDesignation(e.target.value)}
                        />
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
