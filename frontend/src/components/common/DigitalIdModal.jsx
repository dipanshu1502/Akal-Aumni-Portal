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

  const qrPayload = JSON.stringify({
    university: 'Akal University',
    card_id: card.card_number,
    name: alumniName,
    degree: degree,
    batch: batch,
    verification: 'OFFICIALLY_VERIFIED',
  });

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
                    <div className="fw-bold text-white small" style={{ letterSpacing: '0.04em' }}>AKAL UNIVERSITY</div>
                    <div className="text-warning small text-uppercase fw-semibold" style={{ fontSize: '0.62rem' }}>Official Alumni Card</div>
                  </div>
                </div>

                <span className="badge rounded-pill bg-success bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1 small d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                  <ShieldCheck size={12} />
                  VERIFIED
                </span>
              </div>

              {/* Main Card Content */}
              <div className="row g-3 align-items-center my-1">
                <div className="col-8">
                  <div className="text-light text-opacity-50 small mb-0" style={{ fontSize: '0.68rem' }}>ALUMNI NAME</div>
                  <h5 className="fw-bold text-white mb-2">{alumniName}</h5>

                  <div className="text-light text-opacity-50 small mb-0" style={{ fontSize: '0.68rem' }}>PROGRAM & BATCH</div>
                  <div className="small fw-semibold text-warning-emphasis mb-1" style={{ fontSize: '0.78rem' }}>{degree}</div>
                  <div className="badge bg-primary text-white rounded-pill px-2 py-0 fw-normal small" style={{ fontSize: '0.68rem' }}>
                    Batch {batch}
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="col-4 text-center">
                  <div className="p-2 bg-white rounded-3 d-inline-block shadow-sm">
                    <QRCodeSVG 
                      value={qrPayload} 
                      size={80} 
                      bgColor="#FFFFFF" 
                      fgColor="#087BB5" 
                      level="M" 
                    />
                  </div>
                  <div className="text-light text-opacity-50 small mt-1" style={{ fontSize: '0.6rem' }}>SCAN TO VERIFY</div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="d-flex justify-content-between align-items-center pt-3 mt-2 border-top border-white border-opacity-10 small">
                <div>
                  <div className="text-light text-opacity-50" style={{ fontSize: '0.62rem' }}>CARD ID</div>
                  <div className="font-monospace fw-bold text-warning small">{card.card_number}</div>
                </div>
                <div className="text-end">
                  <div className="text-light text-opacity-50" style={{ fontSize: '0.62rem' }}>VALIDITY</div>
                  <div className="text-light text-opacity-90 small">Official Lifetime</div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-light text-opacity-75 small">
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
