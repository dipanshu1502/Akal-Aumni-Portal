import React, { useState } from 'react';
import { Eye, Rocket, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Fixed bottom bar shown only in preview mode (tab opened with ?preview=1).
 * Tells the admin they are looking at unpublished changes and lets them
 * publish or exit without touching the live site.
 */
const PreviewBanner = () => {
  const { isPreview, previewChanges, publishDraft, exitPreview } = useSettings();
  const { isAdmin } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isPreview) return null;

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    const res = await publishDraft();
    setPublishing(false);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => window.location.reload(), 900);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <>
      <div
        className="position-fixed bottom-0 start-0 w-100 shadow-lg"
        style={{ zIndex: 3000, backgroundColor: '#F9B900', borderTop: '3px solid #087bb5' }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3">
          <div className="d-flex align-items-center gap-2 small fw-bold text-dark">
            <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-warning" style={{ width: '26px', height: '26px' }}>
              <Eye size={15} />
            </span>
            <span>
              PREVIEW MODE — aap unpublished changes dekh rahe hain
              <span className="fw-normal ms-1">
                ({previewChanges > 0
                  ? `${previewChanges} change${previewChanges > 1 ? 's' : ''} pending`
                  : 'koi naya change nahi'})
              </span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {message && (
              <span className={`small fw-bold d-flex align-items-center gap-1 ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {message.text}
              </span>
            )}

            {!isAdmin && (
              <span className="small text-dark d-flex align-items-center gap-1">
                <AlertTriangle size={14} /> Publish karne ke liye Admin login chahiye
              </span>
            )}

            {isAdmin && previewChanges > 0 && (
              <button
                type="button"
                className="btn btn-dark btn-sm fw-bold d-flex align-items-center gap-1 rounded-pill px-3"
                onClick={handlePublish}
                disabled={publishing}
              >
                <Rocket size={14} />
                {publishing ? 'Publishing...' : 'Publish Changes'}
              </button>
            )}

            <button
              type="button"
              className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1 rounded-pill px-3"
              onClick={exitPreview}
            >
              <XCircle size={14} />
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      {/* Spacer so the fixed bar never covers page content */}
      <div style={{ height: '54px' }} />
    </>
  );
};

export default PreviewBanner;
