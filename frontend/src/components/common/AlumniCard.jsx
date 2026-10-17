import { ShieldCheck, Award, GraduationCap, MapPin, Building, Sparkles, Mail, Globe, ExternalLink } from 'lucide-react';

const getPhotoSrc = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return photo;
};

const AlumniCard = ({ alumni, onConnect }) => {
  const fullName = `${alumni.first_name} ${alumni.last_name || ''}`;
  const isDistinguished = Boolean(Number(alumni.is_distinguished));
  const isMentor = Boolean(Number(alumni.is_mentor));
  const photoSrc = getPhotoSrc(alumni.profile_photo);

  const skillsList = alumni.skills 
    ? alumni.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) 
    : [];

  return (
    <div className={`akal-card h-100 d-flex flex-column ${isDistinguished ? 'border-warning border-2' : ''}`}>
      {/* Top Banner Accent */}
      <div 
        className="w-100 py-1"
        style={{ 
          background: isDistinguished 
            ? 'var(--grad-gold-foil)' 
            : 'var(--grad-primary)',
          height: '6px'
        }}
      />

      <div className="p-4 d-flex flex-column flex-grow-1">
        {/* Header with Avatar and Badges */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={fullName}
                className="rounded-circle shadow-sm object-fit-cover"
                style={{ width: '54px', height: '54px', objectFit: 'cover', border: isDistinguished ? '2px solid #F9B900' : '2px solid #E2E8F0' }}
              />
            ) : (
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{ 
                width: '54px', 
                height: '54px', 
                fontSize: '20px',
                background: isDistinguished 
                  ? 'linear-gradient(135deg, #172333 0%, #075985 100%)' 
                  : 'var(--grad-primary)',
                border: isDistinguished ? '2px solid #F9B900' : '2px solid #E2E8F0'
              }}
            >
              {alumni.first_name[0]}{alumni.last_name ? alumni.last_name[0] : ''}
            </div>
            )}

            <div>
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-1">
                {fullName}
              </h5>
              <div className="text-primary small fw-semibold">
                {alumni.current_designation || 'Alumni Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {isDistinguished && (
            <span className="badge-akal-distinguished">
              <Sparkles size={12} />
              Distinguished
            </span>
          )}
          {isMentor && (
            <span className="badge-akal-mentor">
              <Award size={12} />
              Mentor
            </span>
          )}
          <span className="badge-akal-verified">
            <ShieldCheck size={12} />
            Verified
          </span>
        </div>

        {/* Company & Location Info */}
        <div className="d-flex flex-column gap-2 small text-muted mb-3 flex-grow-1">
          {alumni.current_company && (
            <div className="d-flex align-items-center gap-2">
              <Building size={15} className="text-primary flex-shrink-0" />
              <span className="fw-semibold text-dark">{alumni.current_company}</span>
            </div>
          )}

          <div className="d-flex align-items-center gap-2">
            <GraduationCap size={15} className="text-warning flex-shrink-0" />
            <span className="text-truncate">{alumni.degree || alumni.department} (Batch {alumni.batch_year || alumni.graduation_year})</span>
          </div>

          {alumni.location_city && (
            <div className="d-flex align-items-center gap-2">
              <MapPin size={15} className="text-danger flex-shrink-0" />
              <span>{alumni.location_city}{alumni.location_country ? `, ${alumni.location_country}` : ''}</span>
            </div>
          )}

          {alumni.bio && (
            <p className="text-secondary small mt-2 mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {alumni.bio}
            </p>
          )}
        </div>

        {/* Skills Chips */}
        {skillsList.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {skillsList.map((skill, idx) => (
              <span key={idx} className="badge bg-light text-secondary border px-2 py-1 small rounded-pill" style={{ fontSize: '0.7rem' }}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Action Row */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
          <div className="d-flex gap-2">
            {alumni.linkedin_url && (
              <a 
                href={alumni.linkedin_url.startsWith('http') ? alumni.linkedin_url : `https://${alumni.linkedin_url}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm btn-outline-primary rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
                title="Professional Profile"
              >
                <Globe size={15} />
              </a>
            )}
            {alumni.public_email && (
              <a 
                href={`mailto:${alumni.public_email}`} 
                className="btn btn-sm btn-outline-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
                title="Send Email"
              >
                <Mail size={15} />
              </a>
            )}
          </div>

          {isMentor ? (
            <button 
              onClick={() => onConnect && onConnect(alumni)} 
              className="btn btn-sm btn-akal-yellow"
            >
              Request Mentorship
            </button>
          ) : (
            <button 
              onClick={() => onConnect && onConnect(alumni)} 
              className="btn btn-sm btn-akal-outline"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniCard;
