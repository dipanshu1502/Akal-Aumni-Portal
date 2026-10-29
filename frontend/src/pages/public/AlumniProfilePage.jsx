import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, GraduationCap, Building, MapPin, Briefcase, BookOpen, Landmark, ArrowLeft, Award, Mail } from 'lucide-react';

const getPhotoSrc = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return photo;
};

const statusLabel = (s) => (s === 'higher_study' ? 'Higher Study' : s === 'job' ? 'Job / Professional' : s === 'other' ? 'Other' : '—');

const AlumniProfilePage = () => {
  const { alumniId } = useParams();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/public/alumni/${alumniId}`);
        if (res.status && res.data) setAlumni(res.data);
        else setNotFound(true);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [alumniId]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <div className="spinner-border text-akal-blue" />
        <div className="small text-akal-muted mt-2">Loading verified profile…</div>
      </div>
    );
  }

  if (notFound || !alumni) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <h4 className="fw-bold text-akal-navy">Profile Not Found</h4>
        <p className="text-akal-muted small">No verified public profile was found for Alumni ID ({alumniId}).</p>
        <Link to="/directory" className="btn btn-akal-primary btn-sm">Back to Directory</Link>
      </div>
    );
  }

  const fullName = `${alumni.first_name} ${alumni.last_name || ''}`.trim();
  const photoSrc = getPhotoSrc(alumni.profile_photo);
  const workLine = [alumni.current_designation, alumni.current_company].filter(Boolean).join(' at ');

  return (
    <div className="alumni-profile-page py-4 bg-white min-vh-100">
      <div className="container">
        <Link to="/directory" className="btn btn-sm btn-akal-outline mb-3">
          <ArrowLeft size={14} className="me-1" /> Back to Alumni Directory
        </Link>
        <div className="akal-card p-0 bg-white border-akal-border-grey overflow-hidden shadow-sm">
          {/* Top Banner */}
          <div style={{ background: 'var(--akal-navy)', height: '120px', borderBottom: '3px solid var(--akal-yellow)' }} />

          <div className="p-4" style={{ marginTop: '-60px' }}>
            <div className="d-flex flex-wrap gap-3 align-items-end mb-4">
              {photoSrc ? (
                <img 
                  src={photoSrc} 
                  alt={fullName} 
                  className="rounded-3 shadow"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #FFFFFF' }} 
                />
              ) : (
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow"
                  style={{ width: '120px', height: '120px', fontSize: '38px', background: 'var(--akal-blue)', border: '3px solid #FFFFFF' }}
                >
                  {alumni.first_name?.[0]}{alumni.last_name?.[0] || ''}
                </div>
              )}
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h2 className="fw-bold text-akal-navy mb-0">{fullName}</h2>
                  <span className="badge-akal-verified"><ShieldCheck size={12} /> Verified</span>
                  {Number(alumni.is_mentor) === 1 && (<span className="badge-akal-mentor"><Award size={12} /> Mentor</span>)}
                </div>
                <div className="text-akal-blue fw-semibold">{workLine || 'Alumni Member'}</div>
                <div className="font-monospace small text-akal-muted">{alumni.alumni_id || ''}{alumni.auid ? ` • AUID ${alumni.auid}` : ''}</div>
              </div>
            </div>

            <div className="row g-4 mt-2">
              <div className="col-lg-7">
                <h6 className="fw-bold text-akal-navy border-bottom border-akal-border-grey pb-2">
                  <GraduationCap size={16} className="me-1 text-akal-blue" /> Academic Background
                </h6>
                <div className="small text-akal-secondary mb-1">Degree: <strong className="text-akal-navy">{alumni.degree || '—'}</strong></div>
                <div className="small text-akal-secondary mb-1">Department: <strong className="text-akal-navy">{alumni.department || '—'}</strong></div>
                <div className="small text-akal-secondary mb-3">Batch Year: <strong className="text-akal-navy">{alumni.batch_year || '—'}</strong></div>

                <h6 className="fw-bold text-akal-navy border-bottom border-akal-border-grey pb-2 mt-4">
                  <Briefcase size={16} className="me-1 text-akal-blue" /> Current Role — {statusLabel(alumni.current_status)}
                </h6>
                {alumni.current_status === 'higher_study' && (
                  <div className="small text-akal-secondary">
                    <div><BookOpen size={13} className="me-1 text-akal-blue" />{alumni.study_institution || '—'}{alumni.study_course ? ` • ${alumni.study_course}` : ''}</div>
                    {alumni.study_location && <div className="mt-1">City: {alumni.study_location}</div>}
                  </div>
                )}
                {alumni.current_status === 'job' && (
                  <div className="small text-akal-secondary">
                    <div>
                      {alumni.job_type === 'government' ? <Landmark size={13} className="me-1 text-akal-blue" /> : <Building size={13} className="me-1 text-akal-blue" />}
                      {alumni.job_type === 'government' ? 'Government' : 'Private'}: {alumni.job_organization || alumni.current_company || '—'}
                    </div>
                    {(alumni.job_designation || alumni.current_designation) && <div className="mt-1">Designation: {alumni.job_designation || alumni.current_designation}</div>}
                    {alumni.job_location && <div className="mt-1">Location: {alumni.job_location}</div>}
                  </div>
                )}
                {(!alumni.current_status || alumni.current_status === 'other') && (
                  <div className="small text-akal-muted">{workLine || 'Details not shared.'}</div>
                )}
                {alumni.bio && (
                  <>
                    <h6 className="fw-bold text-akal-navy border-bottom border-akal-border-grey pb-2 mt-4">Biography</h6>
                    <p className="small text-akal-secondary">{alumni.bio}</p>
                  </>
                )}
              </div>

              <div className="col-lg-5">
                <div className="p-3 rounded-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                  <h6 className="fw-bold text-akal-blue mb-2">Digital Identification & Verification</h6>
                  <div className="small text-akal-secondary mb-1">Alumni ID: <span className="font-monospace fw-bold text-akal-navy">{alumni.alumni_id || '—'}</span></div>
                  <div className="small text-akal-secondary mb-1">AUID: <span className="font-monospace fw-bold text-akal-navy">{alumni.auid || '—'}</span></div>
                  {(alumni.location_city || alumni.location_country) && (
                    <div className="small text-akal-secondary mt-2">
                      <MapPin size={13} className="me-1 text-akal-blue" />
                      {alumni.location_city}{alumni.location_country ? `, ${alumni.location_country}` : ''}
                    </div>
                  )}
                  {alumni.public_email && (
                    <a href={`mailto:${alumni.public_email}`} className="btn btn-sm btn-akal-primary w-100 mt-3 justify-content-center">
                      <Mail size={14} /> Contact via Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfilePage;
