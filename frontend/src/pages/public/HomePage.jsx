import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AlumniCard from '../../components/common/AlumniCard';
import { useSettings } from '../../context/SettingsContext';
import { 
  Users, 
  Award, 
  Calendar, 
  Briefcase, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  CheckCircle2, 
  GraduationCap,
  Bell,
  ChevronRight,
  CreditCard,
  Heart,
  Landmark,
  MapPin,
  QrCode,
  ExternalLink
} from 'lucide-react';

const HomePage = () => {
  const { getSetting } = useSettings();
  const [stats, setStats] = useState(null);
  const [distinguishedAlumni, setDistinguishedAlumni] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [stories, setStories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroBadge = getSetting('hero_badge_text', 'OFFICIAL ALUMNI & ENGAGEMENT PLATFORM');
  const heroTitleLine1 = getSetting('hero_headline_line1', 'Once Akalite,');
  const heroTitleHighlight = getSetting('hero_headline_highlight', 'Always Akalite.');
  const heroDesc = getSetting('hero_description', 'Welcome to the official Akal University Alumni Portal. Reconnect with batchmates, mentor ambitious students, discover global career opportunities, and celebrate lifelong university pride.');
  const heroCta1Text = getSetting('hero_cta_primary_text', 'Explore Alumni Directory');
  const heroCta1Link = getSetting('hero_cta_primary_link', '/directory');
  const heroCta2Text = getSetting('hero_cta_secondary_text', 'Join Alumni Network');
  const heroCta2Link = getSetting('hero_cta_secondary_link', '/register');

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        api.get('/public/stats'),
        api.get('/public/alumni?distinguished=1'),
        api.get('/public/events?filter=upcoming'),
        api.get('/public/jobs'),
        api.get('/public/stories'),
        api.get('/public/donations'),
        api.get('/public/news')
      ]);

      const [statsRes, alumniRes, eventsRes, jobsRes, storiesRes, donationsRes, newsRes] = results;

      if (statsRes.status === 'fulfilled' && statsRes.value?.status) {
        const rawStats = statsRes.value.data;
        setStats(rawStats?.counts ? { ...rawStats, ...rawStats.counts } : rawStats);
      }
      if (alumniRes.status === 'fulfilled' && alumniRes.value?.status && Array.isArray(alumniRes.value.data)) {
        setDistinguishedAlumni(alumniRes.value.data.slice(0, 3));
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.status && Array.isArray(eventsRes.value.data)) {
        setUpcomingEvents(eventsRes.value.data.slice(0, 3));
      }
      if (jobsRes.status === 'fulfilled' && jobsRes.value?.status && Array.isArray(jobsRes.value.data)) {
        setRecentJobs(jobsRes.value.data.slice(0, 3));
      }
      if (storiesRes.status === 'fulfilled' && storiesRes.value?.status && Array.isArray(storiesRes.value.data)) {
        setStories(storiesRes.value.data.slice(0, 2));
      }
      if (donationsRes.status === 'fulfilled' && donationsRes.value?.status && Array.isArray(donationsRes.value.data)) {
        setCampaigns(donationsRes.value.data.slice(0, 2));
      }
      if (newsRes.status === 'fulfilled' && newsRes.value?.status && Array.isArray(newsRes.value.data)) {
        setNews(newsRes.value.data.slice(0, 3));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="home-page bg-white">
      {/* ─────────────────────────────────────────────────────────────
         1. Hero Section - White-first, Spacious, Brand Accent
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 bg-white border-bottom position-relative overflow-hidden">
        <div className="container py-lg-4 position-relative z-1">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              {/* Badges */}
              <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                  style={{ backgroundColor: 'var(--akal-blue-soft)', border: '1px solid var(--akal-blue)', color: 'var(--akal-blue)' }}
                >
                  <Sparkles size={14} />
                  <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>{heroBadge}</span>
                </div>
                <div
                  className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill bg-light text-secondary border small fw-semibold"
                >
                  <ShieldCheck size={14} className="text-success" />
                  <span>NAAC 'A' Grade Accredited</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="display-4 fw-bold text-akal-navy mb-3" style={{ lineHeight: 1.18 }}>
                {heroTitleLine1}{' '}
                <span className="text-akal-blue">{heroTitleHighlight}</span>
              </h1>

              {/* Lead Description */}
              <p className="lead text-akal-secondary mb-4 pe-lg-4" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
                {heroDesc}
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to={heroCta1Link} className="btn btn-akal-primary btn-lg px-4">
                  <span>{heroCta1Text}</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to={heroCta2Link} className="btn btn-akal-yellow btn-lg px-4">
                  <span>{heroCta2Text}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="d-flex align-items-center gap-4 pt-3 border-top border-akal-border-grey small text-akal-secondary flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-akal-blue" />
                  <span className="fw-semibold">Official University Network</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CreditCard size={18} className="text-akal-blue" />
                  <span className="fw-semibold">Digital Alumni ID Card</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Globe size={18} className="text-akal-blue" />
                  <span className="fw-semibold">Global AUAA Chapters</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Digital ID Card Preview & Highlights */}
            <div className="col-lg-5">
              <div
                className="akal-card p-4 shadow-sm border-akal-border-grey position-relative"
                style={{ background: 'var(--akal-soft-white)' }}
              >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-akal-border-grey">
                  <div className="d-flex align-items-center gap-2">
                    <div className="university-crest">AU</div>
                    <div>
                      <h6 className="mb-0 fw-bold text-akal-navy">Akal University Alumni Portal</h6>
                      <span className="text-akal-muted small" style={{ fontSize: '0.75rem' }}>Official Alumni Credentials</span>
                    </div>
                  </div>
                  <span className="badge-akal-distinguished">
                    <ShieldCheck size={13} className="me-1" /> Verified
                  </span>
                </div>

                {/* Simulated Digital ID Card Preview */}
                <div
                  className="rounded-3 p-3 mb-3 text-white position-relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--akal-navy)',
                    border: '1.5px solid var(--akal-yellow)',
                    boxShadow: '0 8px 24px rgba(23, 35, 51, 0.18)'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--grad-gold-foil)' }}></div>
                  <div className="d-flex justify-content-between align-items-start mb-2 pt-1">
                    <div>
                      <div className="text-uppercase small fw-bold" style={{ color: 'var(--akal-yellow)', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                        AKAL UNIVERSITY • ALUMNI ID
                      </div>
                      <div className="fw-bold" style={{ fontSize: '1rem' }}>Official Life Membership</div>
                    </div>
                    <div className="p-1 rounded bg-white text-dark d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                      <QrCode size={24} className="text-akal-navy" />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end pt-2 border-top border-secondary border-opacity-25 small">
                    <div>
                      <div className="text-white-50" style={{ fontSize: '0.7rem' }}>ACCESS STATUS</div>
                      <div className="fw-semibold text-white">Full University Privileges</div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50" style={{ fontSize: '0.7rem' }}>VERIFICATION</div>
                      <div className="fw-semibold text-warning">Instant QR Scan</div>
                    </div>
                  </div>
                </div>

                {/* Quick Feature Pillars */}
                <div className="d-flex flex-column gap-2 mb-3">
                  <Link
                    to="/directory"
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border border-akal-border-grey text-decoration-none text-akal-navy"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div className="stat-icon-wrapper stat-icon-blue" style={{ width: 32, height: 32, fontSize: 14 }}>
                        <Users size={16} />
                      </div>
                      <span className="small fw-bold">Alumni Directory & Search</span>
                    </div>
                    <ChevronRight size={16} className="text-akal-muted" />
                  </Link>

                  <Link
                    to="/mentorship"
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border border-akal-border-grey text-decoration-none text-akal-navy"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div className="stat-icon-wrapper stat-icon-yellow" style={{ width: 32, height: 32, fontSize: 14 }}>
                        <HeartHandshake size={16} />
                      </div>
                      <span className="small fw-bold">1-on-1 Alumni Mentorship Hub</span>
                    </div>
                    <ChevronRight size={16} className="text-akal-muted" />
                  </Link>

                  <Link
                    to="/jobs"
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border border-akal-border-grey text-decoration-none text-akal-navy"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div className="stat-icon-wrapper stat-icon-green" style={{ width: 32, height: 32, fontSize: 14 }}>
                        <Briefcase size={16} />
                      </div>
                      <span className="small fw-bold">Career & Job Opportunities</span>
                    </div>
                    <ChevronRight size={16} className="text-akal-muted" />
                  </Link>
                </div>

                <Link to="/register" className="btn btn-akal-primary w-100 justify-content-center">
                  <span>Join the Association</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         2. Alumni Statistics Section (Database-Driven)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
        <div className="container">
          <div className="row g-3">
            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card h-100 bg-white">
                <div className="stat-icon-wrapper stat-icon-blue">
                  <Users size={24} />
                </div>
                <div>
                  <div className="fs-3 fw-bold text-akal-navy">{stats?.total_alumni ?? '1,200+'}</div>
                  <div className="text-akal-secondary small fw-medium">Registered Alumni</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card h-100 bg-white">
                <div className="stat-icon-wrapper stat-icon-yellow">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="fs-3 fw-bold text-akal-navy">{stats?.verified_alumni ?? '950+'}</div>
                  <div className="text-akal-secondary small fw-medium">Verified Graduates</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card h-100 bg-white">
                <div className="stat-icon-wrapper stat-icon-green">
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <div className="fs-3 fw-bold text-akal-navy">{stats?.total_mentors ?? '150+'}</div>
                  <div className="text-akal-secondary small fw-medium">Active Alumni Mentors</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card h-100 bg-white">
                <div className="stat-icon-wrapper stat-icon-purple">
                  <Globe size={24} />
                </div>
                <div>
                  <div className="fs-3 fw-bold text-akal-navy">{(stats?.total_chapters || 0) + (stats?.total_events || 0) || '25+'}</div>
                  <div className="text-akal-secondary small fw-medium">Chapters & Meets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         3. Core Ecosystem Pillars ("What You Can Do")
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '640px' }}>
            <div className="text-akal-blue small text-uppercase fw-bold mb-2" style={{ letterSpacing: '0.08em' }}>PORTAL ECOSYSTEM</div>
            <h2 className="fw-bold text-akal-navy mb-3">Empowering Akal University Graduates Worldwide</h2>
            <p className="text-akal-secondary">
              Designed to connect alumni across generations, accelerate professional growth, and empower current students with real-world mentorship.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="pillar-card">
                <div className="pillar-icon-box stat-icon-blue">
                  <Users size={26} />
                </div>
                <h5 className="fw-bold text-akal-navy mb-2">Alumni Directory</h5>
                <p className="text-akal-secondary small flex-grow-1">
                  Locate and reconnect with batchmates across faculties, graduation years, companies, and global cities with advanced filters.
                </p>
                <Link to="/directory" className="text-akal-blue fw-bold small text-decoration-none d-inline-flex align-items-center gap-1 mt-3">
                  <span>Explore Directory</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="pillar-card">
                <div className="pillar-icon-box stat-icon-yellow">
                  <HeartHandshake size={26} />
                </div>
                <h5 className="fw-bold text-akal-navy mb-2">Mentorship Program</h5>
                <p className="text-akal-secondary small flex-grow-1">
                  Receive personalized 1-on-1 career guidance, resume critiques, mock technical interviews, and graduate school insights.
                </p>
                <Link to="/mentorship" className="text-akal-blue fw-bold small text-decoration-none d-inline-flex align-items-center gap-1 mt-3">
                  <span>Find a Mentor</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="pillar-card">
                <div className="pillar-icon-box stat-icon-green">
                  <Briefcase size={26} />
                </div>
                <h5 className="fw-bold text-akal-navy mb-2">Careers & Referrals</h5>
                <p className="text-akal-secondary small flex-grow-1">
                  Discover curated career opportunities, corporate internships, and employee referrals posted directly by alumni.
                </p>
                <Link to="/jobs" className="text-akal-blue fw-bold small text-decoration-none d-inline-flex align-items-center gap-1 mt-3">
                  <span>Browse Job Board</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="pillar-card">
                <div className="pillar-icon-box stat-icon-purple">
                  <Globe size={26} />
                </div>
                <h5 className="fw-bold text-akal-navy mb-2">Regional Chapters</h5>
                <p className="text-akal-secondary small flex-grow-1">
                  Join city-based chapters across Punjab, Delhi-NCR, Canada, UK, and beyond to attend local reunions and networking meets.
                </p>
                <Link to="/chapters" className="text-akal-blue fw-bold small text-decoration-none d-inline-flex align-items-center gap-1 mt-3">
                  <span>Connect with Chapters</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         4. Featured & Distinguished Alumni Showcase
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 bg-white">
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <div className="text-akal-blue small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>EXCELLENCE IN ACTION</div>
              <h2 className="fw-bold text-akal-navy mb-0">Distinguished Alumni</h2>
            </div>
            <Link to="/directory?distinguished=1" className="btn btn-akal-outline">
              <span>View All Distinguished</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {distinguishedAlumni.map((alm) => (
              <div key={alm.id} className="col-lg-4 col-md-6">
                <AlumniCard alumni={alm} />
              </div>
            ))}
            {!loading && distinguishedAlumni.length === 0 && (
              <div className="col-12">
                <div className="akal-card p-5 text-center text-akal-muted">
                  <Award size={36} className="mx-auto mb-2 text-akal-blue" />
                  <p className="mb-0">Distinguished alumni profiles will appear here as they are recognized.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         5. Upcoming Events & Reunions
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 border-top border-bottom" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <div className="text-akal-blue small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>CAMPUS & GLOBAL MEETS</div>
              <h2 className="fw-bold text-akal-navy mb-0">Upcoming Events & Reunions</h2>
            </div>
            <Link to="/events" className="btn btn-akal-outline">
              <span>All Events</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 p-4 d-flex flex-column bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-akal-blue-soft text-akal-blue fw-bold text-uppercase px-2 py-1" style={{ fontSize: '0.72rem' }}>
                      {ev.event_type}
                    </span>
                    {ev.is_virtual ? (
                      <span className="badge bg-light text-akal-secondary border small">Online / Virtual</span>
                    ) : (
                      <span className="badge bg-light text-akal-navy border small">Campus / In-Person</span>
                    )}
                  </div>

                  <h5 className="fw-bold text-akal-navy mb-2">{ev.title}</h5>
                  <p className="text-akal-secondary small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>

                  <div className="pt-3 border-top border-akal-border-grey mt-auto">
                    <div className="d-flex align-items-center gap-2 small text-akal-secondary mb-3">
                      <Calendar size={15} className="text-akal-blue" />
                      <span>{new Date(ev.start_datetime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <Link to="/events" className="btn btn-sm btn-akal-primary w-100 justify-content-center">
                      <span>Register & Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!loading && upcomingEvents.length === 0 && (
              <div className="col-12">
                <div className="akal-card p-5 text-center text-akal-muted bg-white">
                  <Calendar size={36} className="mx-auto mb-2 text-akal-blue" />
                  <p className="mb-0">No upcoming events scheduled right now. Check back soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         6. Career Opportunities & Jobs
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 bg-white">
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <div className="text-akal-blue small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>CAREER NETWORK</div>
              <h2 className="fw-bold text-akal-navy mb-0">Recent Career Opportunities</h2>
            </div>
            <Link to="/jobs" className="btn btn-akal-outline">
              <span>Explore All Jobs</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="col-lg-4 col-md-6">
                <div className="akal-card p-4 h-100 d-flex flex-column bg-white">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="stat-icon-wrapper stat-icon-blue" style={{ width: 44, height: 44, fontSize: 18 }}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold text-akal-navy mb-1" style={{ fontSize: '1rem' }}>{job.title}</h5>
                      <div className="text-akal-blue small fw-semibold">{job.company_name}</div>
                    </div>
                  </div>
                  <p className="text-akal-secondary small mb-3 flex-grow-1">
                    {job.location || 'Location not specified'} • {(job.job_type || 'Opportunity').replace('_', ' ')}
                  </p>
                  <Link to="/jobs" className="btn btn-sm btn-akal-primary mt-auto justify-content-center">
                    <span>View Opportunity</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
            {!loading && recentJobs.length === 0 && (
              <div className="col-12">
                <div className="akal-card p-5 text-center text-akal-muted">
                  <Briefcase size={36} className="mx-auto mb-2 text-akal-blue" />
                  <p className="mb-0">New career opportunities will appear here when posted by alumni.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         7. Success Stories & Mentorship Hub Spotlight
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5 border-top" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
        <div className="container py-2">
          <div className="row g-4 align-items-stretch">
            {/* Success Story Feature */}
            <div className="col-lg-7">
              <div className="akal-card p-4 p-lg-5 h-100 d-flex flex-column justify-content-between bg-white">
                <div>
                  <div className="d-flex align-items-center gap-2 text-akal-blue fw-bold small text-uppercase mb-2">
                    <Award size={16} />
                    <span>ALUMNI INSPIRATION SPOTLIGHT</span>
                  </div>
                  {stories.length > 0 ? (
                    <>
                      <h3 className="fw-bold text-akal-navy mb-3">{stories[0].title}</h3>
                      <p className="text-akal-secondary lead" style={{ fontSize: '1rem', fontStyle: 'italic' }}>
                        "{stories[0].summary}"
                      </p>
                      <div className="d-flex align-items-center gap-3 mt-4">
                        <div className="rounded-circle bg-akal-blue text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                          AU
                        </div>
                        <div>
                          <div className="fw-bold text-akal-navy">{stories[0].company}</div>
                          <div className="text-akal-muted small">{stories[0].designation} (Batch {stories[0].batch_year})</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="fw-bold text-akal-navy mb-3">Empowering Global Change-Makers</h3>
                      <p className="text-akal-secondary lead" style={{ fontSize: '1rem' }}>
                        From leading technology innovators and research labs to civil services and impactful entrepreneurship, Akal University alumni make meaningful marks across continents.
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-4 mt-3 border-top border-akal-border-grey">
                  <Link to="/stories" className="btn btn-akal-primary">
                    <span>Read Inspiring Stories</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mentorship Promotion Panel */}
            <div className="col-lg-5">
              <div className="akal-card p-4 p-lg-5 h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--akal-navy)', color: '#FFFFFF' }}>
                <div>
                  <span className="badge-akal-distinguished mb-3">
                    CAMPUS MENTORSHIP
                  </span>
                  <h3 className="fw-bold text-white mb-3">Empower the Next Generation</h3>
                  <p className="text-white-50 small mb-4">
                    Are you an alumnus looking to give back? Or a current student seeking career guidance from industry veterans? Connect through our dedicated 1-on-1 mentorship hub.
                  </p>
                  <ul className="list-unstyled small text-white d-flex flex-column gap-2 mb-4">
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Software, Data, Finance & Science career tracks</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Resume review & technical interview preparation</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Guidance for Masters & PhD university admissions</span>
                    </li>
                  </ul>
                </div>

                <Link to="/mentorship" className="btn btn-akal-yellow w-100 justify-content-center">
                  <span>Explore Mentorship Hub</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         8. Dedicated Donations / Giving Back Section
         ───────────────────────────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <section className="py-5 bg-white border-top">
          <div className="container py-2">
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
              <div>
                <div className="text-akal-blue small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>GIVING BACK & IMPACT</div>
                <h2 className="fw-bold text-akal-navy mb-0">Support Your Alma Mater</h2>
              </div>
              <Link to="/donations" className="btn btn-akal-outline">
                <span>View All Campaigns</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="row g-4">
              {campaigns.map((camp) => {
                const target = parseFloat(camp.target_amount) || 0;
                const raised = parseFloat(camp.raised_amount) || 0;
                const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

                return (
                  <div key={camp.id} className="col-lg-6">
                    <div className="akal-card p-4 h-100 d-flex flex-column bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-akal-blue-soft text-akal-blue fw-bold text-uppercase px-2 py-1 small">
                          {camp.category || 'General Fund'}
                        </span>
                        <span className="text-akal-muted small fw-semibold">
                          {camp.total_donors || 0} Donors
                        </span>
                      </div>

                      <h5 className="fw-bold text-akal-navy mb-2">{camp.title}</h5>
                      <p className="text-akal-secondary small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {camp.description}
                      </p>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span className="text-akal-blue">₹{raised.toLocaleString('en-IN')} Raised</span>
                          <span className="text-akal-muted">Goal: ₹{target.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="progress mb-3" style={{ height: '8px', backgroundColor: 'var(--akal-border-grey)' }}>
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${percent}%`, backgroundColor: 'var(--akal-blue)' }} 
                            aria-valuenow={percent} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          />
                        </div>
                        <Link to="/donations" className="btn btn-sm btn-akal-primary w-100 justify-content-center">
                          <span>Contribute to this Campaign</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
         9. Announcements & Latest News
         ───────────────────────────────────────────────────────────── */}
      {news.length > 0 && (
        <section className="py-5 border-top" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
          <div className="container py-2">
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
              <div>
                <div className="text-akal-blue small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>UPDATES & HIGHLIGHTS</div>
                <h2 className="fw-bold text-akal-navy mb-0">Campus Announcements & News</h2>
              </div>
              <Link to="/news-gallery" className="btn btn-akal-outline">
                <span>All News & Gallery</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="row g-4">
              {news.map((item) => (
                <div key={item.id} className="col-lg-4 col-md-6">
                  <div className="akal-card p-4 h-100 d-flex flex-column bg-white">
                    <div className="d-flex align-items-center gap-2 small text-akal-muted mb-2">
                      <Bell size={14} className="text-akal-blue" />
                      <span>{new Date(item.publish_date || item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h5 className="fw-bold text-akal-navy mb-2" style={{ fontSize: '1.05rem' }}>{item.title}</h5>
                    <p className="text-akal-secondary small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary || item.content}
                    </p>
                    <Link to="/news-gallery" className="text-akal-blue small fw-bold mt-2 d-inline-flex align-items-center gap-1">
                      Read more <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
         10. Call to Action Banner - Dark Navy with Gold Accents
         ───────────────────────────────────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--akal-navy)', color: '#FFFFFF' }}>
        <div className="container text-center py-4">
          <div className="university-crest mx-auto mb-3" style={{ width: '52px', height: '52px', fontSize: '22px' }}>
            AU
          </div>
          <h2 className="display-6 fw-bold text-white mb-3">Ready to Reconnect with Akal University?</h2>
          <p className="lead text-white-50 mx-auto mb-4" style={{ maxWidth: '640px', fontSize: '1.1rem' }}>
            Join thousands of graduates across India and around the globe. Get your official verified digital alumni ID card and unlock exclusive networking benefits.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/register" className="btn btn-akal-yellow px-4 py-2">
              <span>Create Alumni Account</span>
            </Link>
            <Link to="/directory" className="btn btn-akal-outline-white px-4 py-2">
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
