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
  X,
  ArrowRight
} from 'lucide-react';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const DonationsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [donateTarget, setDonateTarget] = useState(null);
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
        setSuccessMsg(res.message || 'Thank you for your generous contribution!');
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
    <div className="donations-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-3" style={{ background: 'var(--akal-blue-soft)', border: '1px solid var(--akal-blue)', color: 'var(--akal-blue)', fontSize: '0.8rem', fontWeight: 700 }}>
                <HeartHandshake size={14} />
                <span>GIVING BACK & IMPACT</span>
              </div>
              <h1 className="display-6 fw-bold text-akal-navy mb-2">
                Donations <span className="text-akal-blue">&amp; University Initiatives</span>
              </h1>
              <p className="text-akal-secondary mb-3">
                Support Akal University's impactful initiatives — scholarships for deserving students, modern campus laboratories, academic research, and community outreach.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-akal-primary btn-sm px-3"
                  onClick={() => document.getElementById('campaigns-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  <Target size={15} /> Explore Campaigns
                </button>
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-2 border border-akal-border-grey small text-akal-secondary" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                  <Gift size={14} className="text-warning" />
                  <span>100% of contributions directly support student & campus causes</span>
                </div>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end d-none d-lg-block">
              <div className="stat-icon-wrapper stat-icon-yellow mx-auto mx-lg-end" style={{ width: 80, height: 80, borderRadius: '20px' }}>
                <HeartHandshake size={42} />
              </div>
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
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading campaigns...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading donation campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Gift size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-akal-navy">No Active Donation Campaigns</h5>
            <p className="text-akal-secondary small mb-0">Check back soon — new initiatives and campaigns will be posted here.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((camp) => {
              const target = parseFloat(camp.target_amount) || 0;
              const raised = parseFloat(camp.raised_amount) || 0;
              const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

              return (
                <div key={camp.id} className="col-lg-4 col-md-6">
                  <div className="akal-card h-100 p-0 d-flex flex-column bg-white border-akal-border-grey">
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
                        style={{ height: 140, background: 'var(--akal-navy)' }}
                      >
                        <HeartHandshake size={44} className="text-warning" />
                      </div>
                    )}

                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-akal-blue-soft text-akal-blue text-uppercase px-2 py-1 small fw-bold">
                          {camp.category || 'General Fund'}
                        </span>
                        {camp.is_featured == 1 && (
                          <span className="badge-akal-distinguished">
                            <Sparkles size={12} /> Featured
                          </span>
                        )}
                      </div>

                      <h4 className="fw-bold text-akal-navy mb-2" style={{ fontSize: '1.15rem' }}>{camp.title}</h4>
                      <p className="text-akal-secondary small flex-grow-1" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {camp.description && camp.description.length > 170 ? `${camp.description.slice(0, 170)}…` : camp.description}
                      </p>

                      <div className="my-3 p-3 rounded-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold text-akal-blue">{formatINR(raised)} raised</span>
                          <span className="text-akal-muted d-flex align-items-center gap-1"><Target size={13} /> Goal {formatINR(target)}</span>
                        </div>
                        <div className="progress mb-2" style={{ height: 8, backgroundColor: 'var(--akal-border-grey)' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${pct}%`, backgroundColor: 'var(--akal-blue)' }}
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between small text-akal-secondary">
                          <span className="fw-semibold">{pct}% funded</span>
                          <span>{camp.total_donors || 0} {camp.total_donors === 1 ? 'contributor' : 'contributors'}</span>
                        </div>
                      </div>

                      {camp.start_date && (
                        <div className="d-flex align-items-center gap-2 text-akal-muted small mb-3">
                          <Calendar size={14} className="text-akal-blue" />
                          <span>
                            {new Date(camp.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {camp.end_date
                              ? ` → ${new Date(camp.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              : ' → Ongoing'}
                          </span>
                          {isEnded(camp) && (
                            <span className="badge bg-danger-subtle text-danger small">Ended</span>
                          )}
                        </div>
                      )}

                      {isEnded(camp) ? (
                        <button className="btn btn-light border w-100 mt-auto justify-content-center" disabled>
                          <CheckCircle2 size={16} />
                          <span>Campaign Concluded</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openDonateModal(camp)}
                          className="btn btn-akal-yellow w-100 mt-auto justify-content-center"
                        >
                          <HeartHandshake size={16} />
                          <span>Donate to this Cause</span>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(23, 35, 51, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={() => setDonateTarget(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="p-4 text-white" style={{ backgroundColor: 'var(--akal-navy)' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0">Donate to Campaign</h5>
                    <small className="text-warning">{donateTarget.title}</small>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-light rounded-circle p-1" style={{ width: 32, height: 32 }} onClick={() => setDonateTarget(null)}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleDonate}>
                <div className="modal-body p-4 bg-white">
                  {successMsg ? (
                    <div className="text-center py-4 text-success">
                      <CheckCircle2 size={56} className="text-success mb-3 mx-auto" />
                      <h5 className="fw-bold text-akal-navy">{successMsg}</h5>
                      <p className="text-akal-secondary small mb-0">Your contribution has been recorded in the portal records.</p>
                    </div>
                  ) : (
                    <>
                      {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Donation Amount (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-lg"
                          placeholder="e.g. 1000"
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
                              className={`btn btn-sm px-3 ${parseInt(donationForm.amount) === v ? 'btn-akal-primary' : 'btn-light border'}`}
                              onClick={() => setDonationForm({ ...donationForm, amount: String(v) })}
                            >
                              ₹{v.toLocaleString('en-IN')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Message or Note (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="A personal message or batch tribute..."
                          value={donationForm.message}
                          onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                        />
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="anonDonation"
                          checked={donationForm.is_anonymous}
                          onChange={(e) => setDonationForm({ ...donationForm, is_anonymous: e.target.checked })}
                        />
                        <label className="form-check-label small text-akal-secondary" htmlFor="anonDonation">
                          Donate anonymously (do not show my name publicly)
                        </label>
                      </div>

                      <div className="p-3 border rounded-3 small text-akal-secondary" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Gift size={14} className="text-warning" />
                          <strong className="text-akal-navy">Contributing Account:</strong> {user?.email}
                        </div>
                        Your donation is acknowledged and securely tracked.
                      </div>
                    </>
                  )}
                </div>
                {!successMsg && (
                  <div className="modal-footer px-4 py-3 border-top border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                    <button type="button" className="btn btn-akal-outline btn-sm" onClick={() => setDonateTarget(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-akal-yellow btn-sm" disabled={submitting}>
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
