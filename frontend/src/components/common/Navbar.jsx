import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Zap
} from 'lucide-react';
import DigitalIdModal from './DigitalIdModal';

const Navbar = () => {
  const { user, profile, logout, quickDemoLogin, demoAccounts, isAuthenticated, isAlumni, isStudent, isAdmin, isSuperAdmin } = useAuth();
  const { getSetting, isFeatureEnabled } = useSettings();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const demoMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Scroll par navbar compact ho jaye — content ko zyada vertical space mile
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Demo switcher: bahar click ya Escape karne par band ho
  useEffect(() => {
    if (!showDemoMenu) return undefined;
    const onPointerDown = (e) => {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target)) {
        setShowDemoMenu(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowDemoMenu(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showDemoMenu]);

  // Mobile menu: kisi bhi link/button click par collapse band ho jaye
  const closeMobileMenu = () => {
    const el = document.getElementById('navbarContent');
    if (el && el.classList.contains('show') && window.bootstrap) {
      window.bootstrap.Collapse.getOrCreateInstance(el).hide();
    }
  };

  // Enabled public links — single source of truth for desktop rows + mobile list
  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About' },
    { to: '/auaa', label: 'AUAA', end: true, title: 'Akal University Alumni Association' },
    isFeatureEnabled('enable_public_directory', true) && { to: '/directory', label: 'Directory' },
    isFeatureEnabled('enable_public_events', true) && { to: '/events', label: 'Events' },
    isFeatureEnabled('enable_public_jobs', true) && { to: '/jobs', label: 'Jobs & Internships' },
    isFeatureEnabled('enable_public_mentorship', true) && { to: '/mentorship', label: 'Mentorship' },
    isFeatureEnabled('enable_public_chapters', true) && { to: '/chapters', label: 'Chapters' },
    isFeatureEnabled('enable_public_stories', true) && { to: '/stories', label: 'Stories' },
    isFeatureEnabled('enable_public_gallery', true) && { to: '/news-gallery', label: 'Gallery & News' },
  ].filter(Boolean);

  // Desktop: links ko 2 rows me split (5 + 5)
  const mid = Math.ceil(navLinks.length / 2);
  const linksTop = navLinks.slice(0, mid);
  const linksBottom = navLinks.slice(mid);

  const renderLink = (link) => (
    <li className="nav-item" key={link.to}>
      <NavLink
        to={link.to}
        end={link.end}
        title={link.title}
        onClick={closeMobileMenu}
        className={({ isActive }) => `nav-link px-2 akal-nav-link ${isActive ? 'active-nav' : ''}`}
      >
        {link.label}
      </NavLink>
    </li>
  );

  const showTopBanner = isFeatureEnabled('enable_top_banner', true);
  const bannerBadge = getSetting('top_banner_badge', 'OFFICIAL PORTAL');
  const bannerText = getSetting('top_banner_text', 'Akal University Alumni Network — Connecting Past, Inspiring Future');
  const logoMain = getSetting('logo_text', 'AKAL UNIVERSITY');
  const logoSub = getSetting('logo_subtext', 'Alumni Portal');

  return (
    <>
      {/* Top University Notification & Quick Demo Switcher Bar */}
      {showTopBanner && (
        <div className="akal-topbar text-white py-1 px-3 small">
          <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill px-2 py-1 fw-bold" style={{ fontSize: '0.68rem', background: 'var(--grad-gold-foil)', color: '#172333' }}>{bannerBadge}</span>
              <span className="d-none d-md-inline" style={{ color: 'rgba(255,255,255,0.85)' }}>{bannerText}</span>
            </div>

            {/* Quick Demo Switcher */}
            <div ref={demoMenuRef} className="d-flex align-items-center gap-2 position-relative">
              <span className="small d-none d-sm-inline" style={{ color: 'rgba(255,255,255,0.7)' }}>Quick Role Test:</span>
              <button 
                className="btn btn-sm py-0 px-2 d-flex align-items-center gap-1 text-nowrap fw-bold"
                style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.12)', color: '#FFD75E', border: '1px solid rgba(255,215,94,0.5)' }}
                onClick={() => setShowDemoMenu(!showDemoMenu)}
              >
                <Zap size={12} className="text-warning" />
                {user ? `Active: ${user.role.toUpperCase()}` : 'Select Demo Account'}
                <ChevronDown size={12} />
              </button>

              {showDemoMenu && (
                <div 
                  className="position-absolute end-0 top-100 mt-2 bg-white text-dark rounded-3 shadow-lg p-2 z-3"
                  style={{ minWidth: '260px', border: '1px solid rgba(8, 123, 181, 0.2)' }}
                >
                  <div className="px-2 py-1 small fw-bold text-muted border-bottom mb-1">Select Persona to Test</div>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      className="w-100 text-start btn btn-sm btn-light mb-1 d-flex flex-column py-1 px-2 border-0"
                      onClick={async () => {
                        setShowDemoMenu(false);
                        await quickDemoLogin(acc.email, acc.pass);
                        if (acc.role === 'superadmin' || acc.role === 'admin') navigate('/admin/dashboard');
                        else if (acc.role === 'alumni') navigate('/alumni/dashboard');
                        else if (acc.role === 'student') navigate('/student/dashboard');
                      }}
                    >
                      <span className="fw-bold text-primary">{acc.label}</span>
                      <span className="small text-muted font-monospace" style={{ fontSize: '0.7rem' }}>{acc.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar — single row on desktop: brand | links | actions */}
      <nav id="akal-main-navbar" className={`navbar navbar-expand-xl sticky-top py-1 akal-navbar${isScrolled ? ' akal-nav-scrolled' : ''}`}>
        <div className="container-fluid px-lg-4">
          {/* Brand Logo */}
          <Link to="/" className="university-logo-container" aria-label="Akal University Alumni Portal — Home">
            <div className="university-crest">
              <span>AU</span>
            </div>
            <div className="university-title-text">
              <div className="university-title-main">{logoMain}</div>
              <div className="university-title-sub">{logoSub}</div>
            </div>
          </Link>

          {/* Mobile toggle */}
          <button 
            className="navbar-toggler border-0 ms-auto" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links + Actions — collapsible on mobile, inline on desktop */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-xl-0 fw-semibold justify-content-center align-items-center">

              <li className="nav-item d-xl-none">
                <div className="d-flex gap-2 py-2">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/login" onClick={closeMobileMenu} className="btn btn-akal-outline btn-sm rounded-pill px-3 flex-fill text-center">
                        <LogIn size={15} />
                        <span>Login</span>
                      </Link>
                      <Link to="/register" onClick={closeMobileMenu} className="btn btn-akal-yellow btn-sm rounded-pill px-3 akal-join-btn flex-fill text-center">
                        <span>Join Network</span>
                      </Link>
                    </>
                  ) : (
                    <button onClick={() => { closeMobileMenu(); handleLogout(); }} className="btn btn-outline-danger btn-sm rounded-pill px-3 flex-fill">
                      <LogOut size={15} /> Logout ({user?.role})
                    </button>
                  )}
                </div>
              </li>
              <li className="nav-item">
                <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => `nav-link px-2 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" onClick={closeMobileMenu} className={({ isActive }) => `nav-link px-2 akal-nav-link text-nowrap ${isActive ? 'active-nav' : ''}`}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/auaa" end title="Akal University Alumni Association" className={({ isActive }) => `nav-link px-3 akal-nav-link text-nowrap ${isActive ? 'active-nav' : ''}`}>
                  AUAA
                </NavLink>
              </li>
              {isFeatureEnabled('enable_public_directory', true) && (
                <li className="nav-item">
                  <NavLink to="/directory" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Directory
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_events', true) && (
                <li className="nav-item">
                  <NavLink to="/events" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Events
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_jobs', true) && (
                <li className="nav-item">
                  <NavLink to="/jobs" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Jobs & Internships
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_mentorship', true) && (
                <li className="nav-item">
                  <NavLink to="/mentorship" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Mentorship
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_chapters', true) && (
                <li className="nav-item">
                  <NavLink to="/chapters" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Chapters
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_stories', true) && (
                <li className="nav-item">
                  <NavLink to="/stories" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Stories
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_gallery', true) && (
                <li className="nav-item">
                  <NavLink to="/news-gallery" className={({ isActive }) => `nav-link px-3 akal-nav-link ${isActive ? 'active-nav' : ''}`}>
                    Gallery & News
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Right Action / Auth Buttons */}
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0 flex-shrink-0 text-nowrap">
              {isAuthenticated ? (
                <div className="dropdown">
                  <button 
                    className="btn rounded-pill d-flex align-items-center gap-2 py-1 ps-1 pe-3 akal-user-chip"
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <span className="akal-avatar-ring d-flex">
                      <span className="akal-avatar-inner d-flex align-items-center justify-content-center">
                        {profile?.profile_photo ? (
                          <img src={profile.profile_photo} alt="DP" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                        ) : (
                          <span className="text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '13px', background: 'var(--grad-primary)' }}>
                            {user.email[0].toUpperCase()}
                          </span>
                        )}
                      </span>
                    </span>
                    <div className="text-start d-none d-sm-block" style={{ lineHeight: 1.1 }}>
                      <div className="fw-bold small user-chip-name">{profile?.first_name ? `${profile.first_name}` : user.email.split('@')[0]}</div>
                      <div className="user-chip-role fw-bold" style={{ fontSize: '0.65rem' }}>{user.role.toUpperCase()}</div>
                    </div>
                    <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end mt-2 p-2 rounded-3 akal-dropdown" style={{ minWidth: '220px' }}>
                    <li className="px-3 py-2 border-bottom mb-1 rounded-2" style={{ background: 'var(--grad-hero)' }}>
                      <div className="fw-bold small text-white">{profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` : 'Authenticated User'}</div>
                      <div className="small font-monospace" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>{user.email}</div>
                      <span className="badge rounded-pill mt-1 fw-bold" style={{ fontSize: '0.65rem', background: 'var(--grad-gold-foil)', color: '#172333' }}>
                        {user.role.toUpperCase()}
                      </span>
                    </li>

                    {/* Role Dashboard Link */}
                    {isAlumni && (
                      <>
                        <li>
                          <Link to="/alumni/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2">
                            <User size={16} className="text-primary" />
                            Alumni Dashboard
                          </Link>
                        </li>
                        <li>
                          <button onClick={() => setShowIdModal(true)} className="dropdown-item d-flex align-items-center gap-2 py-2 text-warning-emphasis">
                            <CreditCard size={16} className="text-warning" />
                            Digital Alumni ID
                          </button>
                        </li>
                      </>
                    )}

                    {isStudent && (
                      <li>
                        <Link to="/student/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2">
                          <GraduationCap size={16} className="text-primary" />
                          Student Dashboard
                        </Link>
                      </li>
                    )}

                    {isAdmin && (
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2">
                          <ShieldCheck size={16} className="text-danger" />
                          {isSuperAdmin ? 'Super Admin Console' : 'Admin Management'}
                        </Link>
                      </li>
                    )}

                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2 text-danger py-2">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-none d-lg-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-akal-outline btn-sm rounded-pill px-3 text-nowrap">
                    <LogIn size={15} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="btn btn-akal-yellow btn-sm rounded-pill px-3 akal-join-btn text-nowrap">
                    <span>Join Network</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Digital ID Card Modal */}
      {showIdModal && (
        <DigitalIdModal onClose={() => setShowIdModal(false)} />
      )}
    </>
  );
};

export default Navbar;
