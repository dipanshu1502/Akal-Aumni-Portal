import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { X, Download, ShieldCheck, Sparkles } from "lucide-react";

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
      <div className="modal-dialog modal-dialog-centered digital-id-dialog">
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

          <div className="modal-body digital-id-modal-body p-3 p-md-4 text-center">
            {/* The Digital Card Element */}
            <div className="digital-id-card mx-auto text-start">
              {/* Gold Foil Strip */}
              <div className="id-card-foil-strip"></div>

              {/* Card Header */}
              <div className="digital-id-header d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="digital-id-logo-wrap">
                    <img src="/Akal%20Logo.png" alt="Akal University logo" className="digital-id-logo" />
                  </div>
                  <div className="fw-bold text-white text-uppercase" style={{ letterSpacing: "0.08em" }}>Digital Alumni ID</div>
                </div>
                <div className="badge-akal-distinguished py-2 px-3" style={{ fontSize: "0.8rem" }}>
                  <ShieldCheck size={16} className="me-1" /> VERIFIED
                </div>
              </div>

              {/* Logo, photo, details and QR share one row */}
              <div className="digital-id-member d-flex align-items-center gap-3">
                <div className="flex-shrink-0">
                  {photoSrc ? (
                    <img 
                      src={photoSrc} 
                      alt={alumniName} 
                      className="rounded-3 shadow-sm object-fit-cover" 
                      style={{ width: "102px", height: "102px", border: "2px solid var(--akal-yellow)" }} 
                    />
                  ) : (
                    <div 
                      className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                      style={{ width: "102px", height: "102px", fontSize: "36px", background: "var(--akal-blue)", border: "2px solid var(--akal-yellow)" }}
                    >
                      {alumniName[0]}
                    </div>
                  )}
                </div>

                <div className="digital-id-member-info flex-grow-1 min-w-0">
                  <h5 className="fw-bold mb-1 text-white">{alumniName}</h5>
                  <div className="text-warning fw-semibold mb-1">{degree}</div>
                  <div className="text-white-50">{department} • Batch {batch}</div>
                  <div className="font-monospace text-white-50 mt-1 digital-id-ids">
                    {alumniId}{auid ? ` • AUID ${auid}` : ""}
                  </div>
                </div>

                <div className="digital-id-qr text-center flex-shrink-0">
                  <div className="p-1 bg-white rounded-3 d-inline-block shadow-sm">
                    <QRCodeSVG value={profileUrl} size={80} bgColor="#FFFFFF" fgColor="#172333" level="M" />
                  </div>
                  <div className="text-white-50 mt-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>SCAN PROFILE</div>
                </div>
              </div>
              {/* Card Bottom Meta */}
              <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top border-secondary border-opacity-25 small">
                <div>
                  <div className="text-white-50" style={{ fontSize: "0.62rem", letterSpacing: "0.06em" }}>CARD NUMBER</div>
                  <div className="font-monospace fw-bold text-warning digital-id-card-number">{card.card_number}</div>
                </div>
                <div className="text-end">
                  <div className="text-white-50" style={{ fontSize: "0.62rem", letterSpacing: "0.06em" }}>STATUS</div>
                  <div className="text-white fw-semibold digital-id-status">Official Lifetime Member</div>
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
