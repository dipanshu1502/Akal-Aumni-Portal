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
  BookOpen, 
  HeartHandshake, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

const HomePage = () => {
  const { getSetting, isFeatureEnabled } = useSettings();
  const [stats, setStats] = useState(null);
  const [distinguishedAlumni, setDistinguishedAlumni] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic CMS Settings & Real-Time Live Calculations
  const isAutoCalculate = isFeatureEnabled('auto_calculate_stats', true);

  const heroBadge = getSetting('hero_badge_text', 'OFFICIAL ALUMNI & ENGAGEMENT PLATFORM');
  const heroTitleLine1 = getSetting('hero_headline_line1', 'Connecting Our Past.');
  const heroTitleHighlight = getSetting('hero_headline_highlight', 'Inspiring Our Future.');
  const heroDesc = getSetting('hero_description', 'Welcome to the digital gateway of Akal University\'s global alumni community. Reconnect with batchmates, guide ambitious students, discover career milestones, and celebrate institutional pride.');
  const heroCta1Text = getSetting('hero_cta_primary_text', 'Explore Alumni Directory');
  const heroCta1Link = getSetting('hero_cta_primary_link', '/directory');
  const heroCta2Text = getSetting('hero_cta_secondary_text', 'Join Alumni Network');
  const heroCta2Link = getSetting('hero_cta_secondary_link', '/register');

  // Real-Time live calculated metrics with custom fallback
  const statAlumni = isAutoCalculate && stats?.counts?.total_alumni !== undefined
    ? `${stats.counts.total_alumni}`
    : getSetting('stat_alumni_count', `${stats?.counts?.total_alumni || 5}`);
  const statAlumniLabel = getSetting('stat_alumni_label', 'Registered Alumni');

  const statMentors = isAutoCalculate && stats?.counts?.total_mentors !== undefined
    ? `${stats.counts.total_mentors}`
    : getSetting('stat_mentors_count', `${stats?.counts?.total_mentors || 3}`);
  const statMentorsLabel = getSetting('stat_mentors_label', 'Active Career Mentors');

  const statChapters = isAutoCalculate && stats?.counts?.total_chapters !== undefined
    ? `${stats.counts.total_chapters}`
    : getSetting('stat_chapters_count', `${stats?.counts?.total_chapters || 5}`);
  const statChaptersLabel = getSetting('stat_chapters_label', 'Active Chapters');

  const statJobs = isAutoCalculate && stats?.counts?.total_jobs !== undefined
    ? `${stats.counts.total_jobs}`
    : getSetting('stat_success_rate', `${stats?.counts?.total_jobs || 3}`);
  const statJobsLabel = getSetting('stat_success_label', 'Career Opportunities');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alumniRes, eventsRes, jobsRes, storiesRes] = await Promise.all([
          api.get('/public/stats'),
          api.get('/public/alumni?distinguished=1'),
          api.get('/public/events'),
          api.get('/public/jobs'),
          api.get('/public/stories')
        ]);

        if (statsRes.status) setStats(statsRes.data);
        if (alumniRes.status) setDistinguishedAlumni(alumniRes.data.slice(0, 3));
        if (eventsRes.status) setUpcomingEvents(eventsRes.data.slice(0, 3));
        if (jobsRes.status) setRecentJobs(jobsRes.data.slice(0, 3));
        if (storiesRes.status) setStories(storiesRes.data.slice(0, 2));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section 
        className="py-5 position-relative text-white overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, #075985 0%, #087BB5 50%, #172333 100%)',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background Decorative Circles */}
        <div 
          className="position-absolute rounded-circle opacity-10"
          style={{ 
            width: '600px', 
            height: '600px', 
            background: 'var(--akal-yellow)', 
            top: '-200px', 
            right: '-100px',
            filter: 'blur(80px)' 
          }}
        />
        <div 
          className="position-absolute rounded-circle opacity-15"
          style={{ 
            width: '400px', 
            height: '400px', 
            background: 'var(--akal-blue-light)', 
            bottom: '-150px', 
            left: '-50px',
            filter: 'blur(70px)' 
          }}
        />

        <div className="container position-relative z-1 py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-warning bg-opacity-20 border border-warning border-opacity-40 text-warning small fw-bold mb-3">
                <Sparkles size={14} />
                <span>{heroBadge}</span>
              </div>

              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ lineHeight: 1.15 }}>
                {heroTitleLine1} <br />
                <span style={{ color: 'var(--akal-yellow-bright)' }}>{heroTitleHighlight}</span>
              </h1>

              <p className="lead text-light text-opacity-90 mb-4 pe-lg-4" style={{ fontSize: '1.15rem' }}>
                {heroDesc}
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to={heroCta1Link} className="btn btn-akal-yellow px-4 py-2 fs-6">
                  <span>{heroCta1Text}</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to={heroCta2Link} className="btn btn-akal-outline-white px-4 py-2 fs-6">
                  <span>{heroCta2Text}</span>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="d-flex align-items-center gap-4 mt-4 pt-3 border-top border-white border-opacity-15 small text-light text-opacity-75">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-warning" />
                  <span>Verified Profiles</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <GraduationCap size={18} className="text-warning" />
                  <span>Lifelong Network</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Globe size={18} className="text-warning" />
                  <span>Global Chapters</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card Preview */}
            <div className="col-lg-5">
              <div className="akal-card-glass p-4 rounded-4 text-dark shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="university-crest" style={{ width: '36px', height: '36px', fontSize: '15px' }}>
                      AU
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{getSetting('university_name', 'Akal University')} Alumni</h6>
                      <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Official University Portal</span>
                    </div>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                    ● Live Active
                  </span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-semibold">Alumni Community</span>
                    <span className="fw-bold text-primary">{statAlumni}</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="row g-2 text-center mb-3">
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-white">
                      <div className="fw-bold text-dark fs-5">{statChapters}</div>
                      <div className="text-muted small" style={{ fontSize: '0.68rem' }}>Chapters</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-white">
                      <div className="fw-bold text-primary fs-5">{statMentors}</div>
                      <div className="text-muted small" style={{ fontSize: '0.68rem' }}>Mentors</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-white">
                      <div className="fw-bold text-success fs-5">{statJobs}</div>
                      <div className="text-muted small" style={{ fontSize: '0.68rem' }}>Success</div>
                    </div>
                  </div>
                </div>

                <Link to="/directory" className="btn btn-akal-primary w-100 justify-content-center">
                  <span>Browse Member Profiles</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Statistics KPI Banner */}
      <section className="py-4" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="row g-3">
            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card">
                <div className="stat-icon-wrapper stat-icon-blue">
                  <Users />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statAlumni}</h3>
                  <div className="text-muted small fw-semibold">{statAlumniLabel}</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card">
                <div className="stat-icon-wrapper stat-icon-yellow">
                  <Award />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statMentors}</h3>
                  <div className="text-muted small fw-semibold">{statMentorsLabel}</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card">
                <div className="stat-icon-wrapper stat-icon-green">
                  <Globe />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statChapters}</h3>
                  <div className="text-muted small fw-semibold">{statChaptersLabel}</div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="stat-kpi-card">
                <div className="stat-icon-wrapper stat-icon-purple">
                  <Briefcase />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statJobs}</h3>
                  <div className="text-muted small fw-semibold">{statJobsLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Distinguished Alumni Showcase */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <div className="text-primary small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>EXCELLENCE IN ACTION</div>
              <h2 className="fw-bold mb-0">Distinguished Alumni</h2>
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
          </div>
        </div>
      </section>

      {/* 4. Upcoming Events & Reunions */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <div className="text-warning small text-uppercase fw-bold" style={{ letterSpacing: '0.08em' }}>CAMPUS & GLOBAL MEETS</div>
              <h2 className="fw-bold mb-0">Upcoming Events & Reunions</h2>
            </div>
            <Link to="/events" className="btn btn-akal-outline">
              <span>All Events</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                      {ev.event_type}
                    </span>
                    {ev.is_virtual ? (
                      <span className="badge bg-info-subtle text-info small">Virtual / Online</span>
                    ) : (
                      <span className="badge bg-light text-dark border small">On Campus</span>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{ev.title}</h5>
                  <p className="text-muted small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>

                  <div className="pt-3 border-top mt-auto">
                    <div className="d-flex align-items-center gap-2 small text-muted mb-2">
                      <Calendar size={15} className="text-warning" />
                      <span>{new Date(ev.start_datetime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <Link to="/events" className="btn btn-sm btn-akal-primary w-100 justify-content-center">
                      <span>Register / Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Success Stories & Mentorship Hub Banner */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            {/* Success Story Feature */}
            <div className="col-lg-7">
              <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F8FC 100%)' }}>
                <div>
                  <div className="d-flex align-items-center gap-2 text-warning fw-bold small text-uppercase mb-2">
                    <Award size={16} />
                    <span>ALUMNI INSPIRATION SPOTLIGHT</span>
                  </div>
                  {stories.length > 0 ? (
                    <>
                      <h3 className="fw-bold text-dark mb-3">{stories[0].title}</h3>
                      <p className="text-secondary lead" style={{ fontSize: '1rem' }}>
                        "{stories[0].summary}"
                      </p>
                      <div className="d-flex align-items-center gap-3 mt-3">
                        <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                          AU
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{stories[0].company}</div>
                          <div className="text-muted small">{stories[0].designation} (Batch {stories[0].batch_year})</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">Discover the incredible accomplishments of our graduates across top global corporations and academia.</p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-top">
                  <Link to="/stories" className="btn btn-akal-primary">
                    <span>Read Inspiring Stories</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mentorship Promotion Panel */}
            <div className="col-lg-5">
              <div className="akal-card-dark p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-3">
                    CAMPUS MENTORSHIP
                  </span>
                  <h3 className="fw-bold text-white mb-3">Empower the Next Generation</h3>
                  <p className="text-light text-opacity-80 small mb-4">
                    Are you an alumnus looking to give back? Or a current student seeking career guidance from industry veterans? Connect through our dedicated 1-on-1 mentorship hub.
                  </p>
                  <ul className="list-unstyled small text-light text-opacity-90 d-flex flex-column gap-2 mb-4">
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Software, Data, Finance & Science tracks</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Resume review & technical interview prep</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Guidance for Masters & PhD abroad</span>
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

      {/* 6. Call to Action Banner */}
      <section className="py-5 bg-primary text-white" style={{ background: 'var(--grad-primary)' }}>
        <div className="container text-center py-4">
          <div className="university-crest mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
            AU
          </div>
          <h2 className="display-6 fw-bold mb-3">Ready to Reconnect with Akal University?</h2>
          <p className="lead text-light text-opacity-90 mx-auto mb-4" style={{ maxWidth: '650px' }}>
            Join thousands of graduates across India and around the globe. Get your official verified digital alumni ID card and unlock exclusive networking benefits.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/register" className="btn btn-akal-yellow px-4 py-2 fs-6">
              <span>Create Alumni Account</span>
            </Link>
            <Link to="/directory" className="btn btn-akal-outline-white px-4 py-2 fs-6">
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
