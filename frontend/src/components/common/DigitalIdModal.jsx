import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { X, Download, ShieldCheck, Sparkles, Award } from "lucide-react";

const DigitalIdModal = ({ onClose }) => {
  const { user, profile } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get("/alumni/id-card");
        if (res.status && res.data) {
          setCardData(res.data);
        }
      } catch (err) {
        console.error("Failed to load card:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, []);

  const card = cardData?.card || {
    card_number: "AU-AID-2020-0010",
    issue_date: "2024-01-15",
    expiry_date: "2029-01-15",
  };

  const alumniName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`
    : "Alumni Member";

  const degree = profile?.degree || "Graduate Program";
  const department = profile?.department || "Akal University";
  const batch = profile?.batch_year || "Alumni";
  const photoSrc = profile?.profile_photo || null;
  const alumniId = profile?.alumni_id || card.card_number;
  const auid = profile?.auid || "";

  // QR scan -> public profile page
  let profileUrl = "";
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
    <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(23, 35, 51, 0.7)", backdropFilter: "blur(6px)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px", overflow: "hidden", backgroundColor: "var(--akal-navy)" }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary border-opacity-25 text-white">
            <div className="d-flex align-items-center gap-2">
              <Sparkles size={18} className="text-warning" />
              <span className="fw-bold text-white">Verified Digital Alumni ID Pass</span>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-outline-light rounded-circle p-1" style={{ width: 32, height: 32 }}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body p-4 text-center">
            {/* The Digital Card Element */}
            <div className="digital-id-card mx-auto text-start">
              {/* Gold Foil Strip */}
              <div className="id-card-foil-strip"></div>

              {/* Card Top Row: University Crest & Header */}
              <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="university-crest" style={{ width: "36px", height: "36px", fontSize: "15px" }}>
                    AU
                  </div>
                  <div>
                    <div className="fw-bold text-white small" style={{ letterSpacing: "0.04em" }}>AKAL UNIVERSITY</div>
                    <div className="text-warning small text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.1em" }}>Alumni Association</div>
                  </div>
                </div>
                <div className="badge-akal-distinguished py-1 px-2" style={{ fontSize: "0.65rem" }}>
                  <ShieldCheck size={12} className="me-1" /> VERIFIED
                </div>
              </div>

              {/* Card Middle: Photo, Info, and QR Code */}
              <div className="row g-3 align-items-center my-1">
                <div className="col-auto">
                  {photoSrc ? (
                    <img 
                      src={photoSrc} 
                      alt={alumniName} 
                      className="rounded-3 shadow-sm object-fit-cover" 
                      style={{ width: "68px", height: "68px", border: "2px solid var(--akal-yellow)" }} 
                    />
                  ) : (
                    <div 
                      className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                      style={{ width: "68px", height: "68px", fontSize: "24px", background: "var(--akal-blue)", border: "2px solid var(--akal-yellow)" }}
                    >
                      {alumniName[0]}
                    </div>
                  )}
                </div>

                <div className="col">
                  <h5 className="fw-bold mb-1 text-white" style={{ fontSize: "1.05rem" }}>{alumniName}</h5>
                  <div className="text-warning small fw-semibold text-truncate mb-1">{degree}</div>
                  <div className="small text-white-50">{department} • Batch {batch}</div>
                  <div className="font-monospace small text-white-50 mt-1" style={{ fontSize: "0.72rem" }}>
                    {alumniId}{auid ? ` • AUID ${auid}` : ""}
                  </div>
                </div>

                <div className="col-auto text-center">
                  <div className="p-1 bg-white rounded-3 d-inline-block shadow-sm">
                    <QRCodeSVG
                      value={profileUrl}
                      size={60}
                      bgColor="#FFFFFF"
                      fgColor="#172333"
                      level="M"
                    />
                  </div>
                  <div className="text-white-50 mt-1" style={{ fontSize: "0.58rem", letterSpacing: "0.05em" }}>SCAN PROFILE</div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top border-secondary border-opacity-25 small">
                <div>
                  <div className="text-white-50" style={{ fontSize: "0.62rem", letterSpacing: "0.06em" }}>CARD NUMBER</div>
                  <div className="font-monospace fw-bold text-warning">{card.card_number}</div>
                </div>
                <div className="text-end">
                  <div className="text-white-50" style={{ fontSize: "0.62rem", letterSpacing: "0.06em" }}>STATUS</div>
                  <div className="text-white fw-semibold">Official Lifetime Member</div>
                </div>
              </div>
            </div>

            <div className="mt-3 small text-white-50">
              Recognized for university campus access, alumni reunions, library privileges, and global chapter voting rights.
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
