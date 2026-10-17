import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, GraduationCap, Building, MapPin, Briefcase, BookOpen, Landmark, ArrowLeft, Award } from 'lucide-react';

const getPhotoSrc = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return photo;
};

const statusLabel = (s) => (s === 'higher_study' ? 'Higher Study' : s === 'job' ? 'Job' : s === 'other' ? 'Other' : '—');

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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <div className="small text-muted mt-2">Loading alumni profile…</div>
      </div>
    );
  }

  if (notFound || !alumni) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Profile not found</h4>
        <p className="text-muted small">Ye Alumni ID ({alumniId}) ka public profile available nahi hai.</p>
        <Link to="/directory" className="btn btn-akal-primary btn-sm">Back to Directory</Link>
      </div>
    );
  }

  const fullName = `${alumni.first_name} ${alumni.last_name || ''}`.trim();
  const photoSrc = getPhotoSrc(alumni.profile_photo);
  const workLine = [alumni.current_designation, alumni.current_company].filter(Boolean).join(' at ');

  return (
    <div className="container py-4">
      <Link to="/directory" className="btn btn-sm btn-outline-secondary rounded-pill mb-3">
        <ArrowLeft size={14} className="me-1" /> Directory
      </Link>
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        <div style={{ background: 'var(--grad-primary)', height: '110px' }} />
        <div className="p-4" style={{ marginTop: '-60px' }}>
          <div className="d-flex flex-wrap gap-3 align-items-end">
            {photoSrc ? (
              <img src={photoSrc} alt={fullName} className="rounded-4 border border-white shadow"
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderWidth: '4px' }} />
            ) : (
              <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow"
                style={{ width: '120px', height: '120px', fontSize: '40px', background: 'var(--grad-primary)' }}>
                {alumni.first_name?.[0]}{alumni.last_name?.[0] || ''}
              </div>
            )}
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h2 className="fw-bold mb-0">{fullName}</h2>
                <span className="badge-akal-verified"><ShieldCheck size={12} /> Verified</span>
                {Number(alumni.is_mentor) === 1 && (<span className="badge-akal-mentor"><Award size={12} /> Mentor</span>)}
              </div>
              <div className="text-primary fw-semibold">{workLine || 'Alumni Member'}</div>
              <div className="font-monospace small text-muted">{alumni.alumni_id || ''}{alumni.auid ? ` • AUID ${alumni.auid}` : ''}</div>
            </div>
          </div>
          <div className="row g-4 mt-2">
            <div className="col-lg-7">
              <h6 className="fw-bold border-bottom pb-2"><GraduationCap size={15} className="me-1" /> Academic</h6>
              <div className="small text-muted">Degree: <strong className="text-dark">{alumni.degree || '—'}</strong></div>
              <div className="small text-muted">Department: <strong className="text-dark">{alumni.department || '—'}</strong></div>
              <div className="small text-muted">Batch: <strong className="text-dark">{alumni.batch_year || '—'}</strong></div>
              <h6 className="fw-bold border-bottom pb-2 mt-4"><Briefcase size={15} className="me-1" /> Current — {statusLabel(alumni.current_status)}</h6>
              {alumni.current_status === 'higher_study' && (
                <div className="small text-muted">
                  <div><BookOpen size={13} className="me-1" />{alumni.study_institution || '—'}{alumni.study_course ? ` • ${alumni.study_course}` : ''}</div>
                  {alumni.study_location && <div>City: {alumni.study_location}</div>}
                </div>
              )}
              {alumni.current_status === 'job' && (
                <div className="small text-muted">
                  <div>{alumni.job_type === 'government' ? <Landmark size={13} className="me-1" /> : <Building size={13} className="me-1" />}
                    {alumni.job_type === 'government' ? 'Government' : 'Private'}: {alumni.job_organization || alumni.current_company || '—'}</div>
                  {(alumni.job_designation || alumni.current_designation) && <div>Post: {alumni.job_designation || alumni.current_designation}</div>}
                  {alumni.job_location && <div>City: {alumni.job_location}</div>}
                </div>
              )}
              {(!alumni.current_status || alumni.current_status === 'other') && (<div className="small text-muted">{workLine || 'Details not shared.'}</div>)}
              {alumni.bio && (<><h6 className="fw-bold border-bottom pb-2 mt-4">About</h6><p className="small text-secondary">{alumni.bio}</p></>)}
            </div>
            <div className="col-lg-5">
              <div className="bg-light border rounded-3 p-3">
                <h6 className="fw-bold text-primary mb-2">Card & Verification</h6>
                <div className="small text-muted">Alumni ID: <span className="font-monospace fw-bold text-dark">{alumni.alumni_id || '—'}</span></div>
                <div className="small text-muted">AUID: <span className="font-monospace fw-bold text-dark">{alumni.auid || '—'}</span></div>
                {(alumni.location_city || alumni.location_country) && (
                  <div className="small text-muted"><MapPin size={12} className="me-1" />{alumni.location_city}{alumni.location_country ? `, ${alumni.location_country}` : ''}</div>
                )}
                {alumni.public_email && (<a href={`mailto:${alumni.public_email}`} className="btn btn-sm btn-akal-outline w-100 mt-3">Contact via Email</a>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfilePage;
