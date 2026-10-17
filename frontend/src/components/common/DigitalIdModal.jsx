import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { X, Download, ShieldCheck, CheckCircle2, Award, Calendar, Sparkles } from 'lucide-react';

const DigitalIdModal = ({ onClose }) => {
  const { user, profile } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get('/alumni/id-card');
        if (res.status && res.data) {
          setCardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load card:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, []);

  const card = cardData?.card || {
    card_number: 'AU-AID-2020-0010',
    issue_date: '2024-01-15',
    expiry_date: '2029-01-15',
  };

  const alumniName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}` 
    : 'Harpreet Singh';

  const degree = profile?.degree || 'B.Tech in Computer Science & Engineering';
  const batch = profile?.batch_year || '2016-2020';
  const photoSrc = profile?.profile_photo || null;
  const alumniId = profile?.alumni_id || card.card_number;
  const auid = profile?.auid || '';

  // QR scan -> public profile page par le jaye: /alumni/AUAAxxxxxxxxxx
  let profileUrl = '';
  try {
    if (cardData?.card?.qr_payload) {
      const parsed = JSON.parse(cardData.card.qr_payload);
      if (parsed.profile_url) profileUrl = parsed.profile_url;
    }
  } catch { /* ignore */ }
  if (!profileUrl) {
    profileUrl = `${window.location.origin}/alumni/${alumniId}`;
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(13, 22, 34, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden" style={{ backgroundColor: '#0D1622' }}>
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary border-opacity-25 text-white">
            <div className="d-flex align-items-center gap-2">
              <Sparkles size={18} className="text-warning" />
              <span className="fw-bold">Digital Alumni ID Pass</span>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex">
              <X size={16} />
            </button>
          </div>

          <div className="modal-body p-4 text-center">
            {/* The Digital Card Element */}
            <div className="digital-id-card mx-auto text-start">
              {/* Gold Foil Strip */}
              <div className="id-card-foil-strip"></div>

              {/* Card Top Row */}
              <div className="d-flex justify-content-between align-items-start mb-3 pt-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="university-crest" style={{ width: '38px', height: '38px', fontSize: '16px' }}>
                    AU
                  </div>
                  <div>
                    <div className="fw-bold small" style={{ letterSpacing: '0.04em', color: '#FFFFFF' }}>AKAL UNIVERSITY</div>
                    <div className="text-uppercase fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: '#FFD75E' }}>Official Alumni Card</div>
                  </div>
                </div>

                <span className="badge rounded-pill px-2 py-1 small d-flex align-items-center gap-1 fw-bold" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(25,135,84,0.9)', color: '#FFFFFF', border: '1px solid #FFD75E' }}>
                  <ShieldCheck size={12} />
                  VERIFIED
                </span>
              </div>

              {/* Main Card Content */}
              <div className="row g-3 align-items-center my-1">
                <div className="col-4 text-center">
                  {photoSrc ? (
                    <img src={photoSrc} alt={alumniName}
                      className="rounded-3 border border-warning border-opacity-50"
                      style={{ width: '104px', height: '124px', objectFit: 'cover' }} />
                  ) : (
                    <div className="rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-center fw-bold text-white mx-auto"
                      style={{ width: '104px', height: '124px', fontSize: '30px' }}>
                      {alumniName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div className="fw-bold mt-1" style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: '#9FB3C8' }}>ALUMNI PHOTO</div>
                </div>
                <div className="col-6">
                  <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: '#9FB3C8' }}>Alumni Name</div>
                  <h5 className="fw-bold mb-2" style={{ color: '#FFFFFF' }}>{alumniName}</h5>

                  <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: '#9FB3C8' }}>Program & Batch</div>
                  <div className="small fw-semibold mb-1" style={{ fontSize: '0.8rem', color: '#FFD75E' }}>{degree}</div>
                  <div className="d-flex flex-wrap gap-1">
                    <div className="badge rounded-pill px-2 py-1 fw-bold small" style={{ fontSize: '0.68rem', backgroundColor: '#0B5FFF', color: '#FFFFFF' }}>
                      Batch {batch}
                    </div>
                  </div>
                  <div className="font-monospace fw-bold small mt-2" style={{ fontSize: '0.72rem', color: '#FFD75E' }}>{alumniId}{auid ? ` • AUID ${auid}` : ''}</div>
                </div>

                {/* QR Code Container */}
                <div className="col-2 text-center">
                  <div className="p-1 bg-white rounded-3 d-inline-block shadow-sm">
                    <QRCodeSVG 
                      value={profileUrl} 
                      size={56} 
                      bgColor="#FFFFFF" 
                      fgColor="#087BB5" 
                      level="M" 
                    />
                  </div>
                  <div className="fw-bold mt-1" style={{ fontSize: '0.58rem', letterSpacing: '0.05em', color: '#9FB3C8' }}>SCAN TO VIEW PROFILE</div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="d-flex justify-content-between align-items-center pt-3 mt-2 small" style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: '#9FB3C8' }}>CARD ID</div>
                  <div className="font-monospace fw-bold small" style={{ color: '#FFD75E' }}>{card.card_number}</div>
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', color: '#9FB3C8' }}>VALIDITY</div>
                  <div className="small fw-semibold" style={{ color: '#FFFFFF' }}>Official Lifetime</div>
                </div>
              </div>
            </div>

            <div className="mt-3 small" style={{ color: 'rgba(255,255,255,0.85)' }}>
              This digital alumni identity is recognized for university library, campus access, reunions, and global chapter voting rights.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3 d-flex justify-content-between">
            <button onClick={() => window.print()} className="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
              <Download size={14} />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-akal-yellow btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalIdModal;
