import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Users,
  Target,
  Calendar,
  Gift,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const DonationsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [donateTarget, setDonateTarget] = useState(null); // campaign being donated to
  const [donationForm, setDonationForm] = useState({ amount: '', message: '', is_anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/public/donations');
        if (res.status) setCampaigns(res.data);
      } catch (err) {
        console.error('Error fetching donation campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const categories = ['All', ...Array.from(new Set(campaigns.map(c => c.category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? campaigns : campaigns.filter(c => c.category === activeCategory);

  const isEnded = (c) => !!c.end_date && new Date(`${c.end_date}T23:59:59`) < new Date();

  const openDonateModal = (campaign) => {
    if (isEnded(campaign)) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setDonateTarget(campaign);
    setDonationForm({ amount: '', message: '', is_anonymous: false });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const amount = parseFloat(donationForm.amount);
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid donation amount.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/user/donate', {
        campaign_id: donateTarget.id,
        amount,
        message: donationForm.message,
        is_anonymous: donationForm.is_anonymous,
        payment_method: 'online',
      });
      if (res.status) {
        setSuccessMsg(res.message || 'Thank you for your donation!');
        // Refresh campaign list to show updated raised amount
        const refresh = await api.get('/public/donations');
        if (refresh.status) setCampaigns(refresh.data);
        setTimeout(() => {
          setDonateTarget(null);
          setSuccessMsg('');
        }, 2500);
      } else {
        setErrorMsg(res.message || 'Donation failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Donation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donations-page py-4">
      <div className="container">
        {/* Header */}
        <div className="rounded-4 p-4 p-lg-5 mb-4 text-white position-relative overflow-hidden" style={{ background: 'var(--grad-hero)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Decorative glows & dot pattern */}
          <div className="position-absolute rounded-circle" style={{ width: 300, height: 300, top: -110, right: -70, background: 'radial-gradient(circle, rgba(249,185,0,0.35) 0%, rgba(249,185,0,0) 70%)', pointerEvents: 'none' }}></div>
          <div className="position-absolute rounded-circle" style={{ width: 240, height: 240, bottom: -100, left: -60, background: 'radial-gradient(circle, rgba(41,169,224,0.35) 0%, rgba(41,169,224,0) 70%)', pointerEvents: 'none' }}></div>
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none', opacity: 0.5 }}></div>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4 position-relative" style={{ zIndex: 1 }}>
            <div style={{ maxWidth: 640 }}>
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-3 animate-pulse-subtle" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                <HeartHandshake size={14} className="text-warning" />
                <span>MAKE A DIFFERENCE</span>
                <span className="rounded-circle" style={{ width: 7, height: 7, background: 'var(--akal-yellow-bright)' }}></span>
              </div>
              <h1 className="display-6 fw-bold mb-2 text-white">
                Donations <span style={{ color: 'var(--akal-yellow-bright)' }}>&amp; Fundraising</span>
              </h1>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Support Akal University's initiatives — scholarships, campus development, research and community relief. Every contribution counts.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button
                  className="btn btn-akal-yellow rounded-pill fw-bold px-4"
                  onClick={() => document.getElementById('campaigns-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  <Target size={16} /> Explore Campaigns
                </button>
                <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
                  <Gift size={14} className="text-warning" />
                  <span>Every rupee makes an impact</span>
                </div>
              </div>
            </div>

            {/* Hero visual — floating glass heart */}
            <div className="d-none d-lg-flex position-relative align-items-center justify-content-center donation-float" style={{ width: 170, height: 170 }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 150, height: 150, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.20)' }}>
                <HeartHandshake size={68} style={{ color: 'var(--akal-yellow-bright)' }} />
              </div>
              <Sparkles size={22} className="position-absolute text-warning" style={{ top: 6, right: 14 }}></Sparkles>
              <Users size={18} className="position-absolute" style={{ bottom: 12, left: 4, color: 'rgba(255,255,255,0.85)' }}></Users>
              <span className="position-absolute rounded-circle" style={{ width: 12, height: 12, background: 'var(--akal-yellow)', top: 24, left: -4 }}></span>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="d-flex flex-wrap gap-2 mb-4" id="campaigns-grid">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <Gift size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No active donation campaigns</h5>
            <p className="text-muted mb-0">Check back soon — the admin team regularly publishes new causes to support.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((camp) => {
              const pct = camp.target_amount > 0 ? Math.min(100, Math.round((camp.raised_amount / camp.target_amount) * 100)) : 0;
              return (
                <div key={camp.id} className="col-lg-4 col-md-6">
                  <div className="akal-card h-100 p-0 d-flex flex-column overflow-hidden">
                    {camp.cover_image ? (
                      <img
                        src={camp.cover_image}
                        alt={camp.title}
                        className="w-100"
                        style={{ height: 160, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="w-100 d-flex align-items-center justify-content-center text-white"
                        style={{ height: 160, background: 'var(--grad-primary)' }}
                      >
                        <HeartHandshake size={48} />
                      </div>
                    )}

                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary text-white text-uppercase px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                          {camp.category}
                        </span>
                        {camp.is_featured == 1 && (
                          <span className="badge text-warning d-flex align-items-center gap-1" style={{ background: 'var(--akal-yellow-soft)' }}>
                            <Sparkles size={12} /> Featured
                          </span>
                        )}
                      </div>

                      <h4 className="fw-bold text-dark mb-2">{camp.title}</h4>
                      <p className="text-muted small flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                        {camp.description && camp.description.length > 180 ? `${camp.description.slice(0, 180)}…` : camp.description}
                      </p>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold text-success">{formatINR(camp.raised_amount)} raised</span>
                          <span className="text-muted d-flex align-items-center gap-1"><Target size={13} /> Goal {formatINR(camp.target_amount)}</span>
                        </div>
                        <div className="progress" style={{ height: 10 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${pct}%`, background: 'var(--grad-yellow)' }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mt-1">
                          <span className="d-flex align-items-center gap-1"><Target size={13} /> {pct}% funded</span>
                          <span className="d-flex align-items-center gap-1"><Users size={13} /> {camp.total_donors || 0} {camp.total_donors === 1 ? 'donor' : 'donors'}</span>
                        </div>
                      </div>

                      {camp.start_date && (
                        <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                          <Calendar size={14} />
                          <span>
                            {new Date(camp.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {camp.end_date
                              ? ` → ${new Date(camp.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              : ' → Ongoing'}
                          </span>
                          {isEnded(camp) && (
                            <span className="badge text-danger" style={{ background: 'rgba(220, 53, 69, 0.12)' }}>Ended</span>
                          )}
                        </div>
                      )}

                      {isEnded(camp) ? (
                        <button className="btn btn-light border w-100 mt-auto justify-content-center" disabled>
                          <CheckCircle2 size={16} />
                          <span>Campaign Ended</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openDonateModal(camp)}
                          className="btn btn-akal-yellow w-100 mt-auto justify-content-center"
                        >
                          <HeartHandshake size={16} />
                          <span>Donate Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Donate Modal */}
      {donateTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(13, 22, 34, 0.6)' }} onClick={() => setDonateTarget(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0" style={{ background: 'var(--grad-primary)' }}>
                <div>
                  <h5 className="modal-title fw-bold text-white mb-0">Donate to</h5>
                  <small style={{ color: 'rgba(255,255,255,0.85)' }}>{donateTarget.title}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDonateTarget(null)}></button>
              </div>

              <form onSubmit={handleDonate}>
                <div className="modal-body">
                  {successMsg ? (
                    <div className="text-center py-3">
                      <CheckCircle2 size={56} className="text-success mb-3" />
                      <h5 className="fw-bold text-success">{successMsg}</h5>
                      <p className="text-muted small mb-0">Your contribution has been recorded.</p>
                    </div>
                  ) : (
                    <>
                      {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Donation Amount (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-lg"
                          placeholder="e.g. 500"
                          value={donationForm.amount}
                          onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                          required
                          autoFocus
                        />
                        <div className="d-flex gap-2 mt-2 flex-wrap">
                          {[500, 1000, 2500, 5000].map(v => (
                            <button
                              key={v}
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 ${parseInt(donationForm.amount) === v ? 'btn-akal-yellow' : 'btn-light border'}`}
                              onClick={() => setDonationForm({ ...donationForm, amount: String(v) })}
                            >
                              ₹{v.toLocaleString('en-IN')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Message (optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="A note of support..."
                          value={donationForm.message}
                          onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                        />
                      </div>

                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="anonDonation"
                          checked={donationForm.is_anonymous}
                          onChange={(e) => setDonationForm({ ...donationForm, is_anonymous: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="anonDonation">Donate anonymously (hide my name)</label>
                      </div>

                      <div className="bg-light border rounded-3 p-3 small text-muted">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Gift size={14} className="text-warning" />
                          <strong>You are donating as:</strong> {user?.email}
                        </div>
                        Your donation is recorded instantly and adds to this campaign's goal. Tick the box above if you'd like to appear as <strong>Anonymous</strong>.
                      </div>
                    </>
                  )}
                </div>
                {!successMsg && (
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light border" onClick={() => setDonateTarget(null)}>
                      <X size={15} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-akal-yellow" disabled={submitting}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span> Processing…</>
                      ) : (
                        <><HeartHandshake size={16} /> Donate {donationForm.amount ? formatINR(donationForm.amount) : ''}</>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;

