import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  Award, 
  Users, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Image, 
  Bell, 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronDown,
  CreditCard,
  Zap
} from 'lucide-react';
import DigitalIdModal from './DigitalIdModal';

const Navbar = () => {
  const { user, profile, logout, quickDemoLogin, demoAccounts, isAuthenticated, isAlumni, isStudent, isAdmin, isSuperAdmin } = useAuth();
  const { getSetting, isFeatureEnabled } = useSettings();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showTopBanner = isFeatureEnabled('enable_top_banner', true);
  const bannerBadge = getSetting('top_banner_badge', 'OFFICIAL PORTAL');
  const bannerText = getSetting('top_banner_text', 'Akal University Alumni Network — Connecting Past, Inspiring Future');
  const logoMain = getSetting('logo_text', 'AKAL UNIVERSITY');
  const logoSub = getSetting('logo_subtext', 'Alumni Portal');

  return (
    <>
      {/* Top University Notification & Quick Demo Switcher Bar */}
      {showTopBanner && (
        <div className="bg-dark text-white py-1 px-3 border-bottom border-secondary border-opacity-25 small" style={{ backgroundColor: 'var(--akal-navy-dark)' }}>
          <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2 text-warning">
              <span className="badge rounded-pill bg-warning text-dark px-2 py-1 fw-bold" style={{ fontSize: '0.68rem' }}>{bannerBadge}</span>
              <span className="d-none d-md-inline opacity-75">{bannerText}</span>
            </div>

            {/* Quick Demo Switcher */}
            <div className="d-flex align-items-center gap-2 position-relative">
              <span className="text-light opacity-50 small d-none d-sm-inline">Quick Role Test:</span>
              <button 
                className="btn btn-sm btn-outline-warning py-0 px-2 d-flex align-items-center gap-1 text-nowrap"
                style={{ fontSize: '0.75rem' }}
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

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top py-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="container-fluid px-lg-4">
          {/* Brand Logo */}
          <Link to="/" className="university-logo-container">
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
            className="navbar-toggler border-0" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                  Home
                </NavLink>
              </li>
              {isFeatureEnabled('enable_public_directory', true) && (
                <li className="nav-item">
                  <NavLink to="/directory" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Directory
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_events', true) && (
                <li className="nav-item">
                  <NavLink to="/events" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Events
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_jobs', true) && (
                <li className="nav-item">
                  <NavLink to="/jobs" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Jobs & Internships
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_mentorship', true) && (
                <li className="nav-item">
                  <NavLink to="/mentorship" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Mentorship
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_chapters', true) && (
                <li className="nav-item">
                  <NavLink to="/chapters" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Chapters
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_stories', true) && (
                <li className="nav-item">
                  <NavLink to="/stories" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Stories
                  </NavLink>
                </li>
              )}
              {isFeatureEnabled('enable_public_gallery', true) && (
                <li className="nav-item">
                  <NavLink to="/news-gallery" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary fw-bold' : ''}`}>
                    Gallery & News
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Right Action / Auth Buttons */}
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
              {isAuthenticated ? (
                <div className="dropdown">
                  <button 
                    className="btn btn-light rounded-pill border d-flex align-items-center gap-2 py-1 px-3"
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px', fontSize: '13px' }}>
                      {user.email[0].toUpperCase()}
                    </div>
                    <div className="text-start d-none d-sm-block" style={{ lineHeight: 1.1 }}>
                      <div className="fw-bold small">{profile?.first_name ? `${profile.first_name}` : user.email.split('@')[0]}</div>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>{user.role.toUpperCase()}</div>
                    </div>
                    <ChevronDown size={14} className="text-muted" />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2 rounded-3" style={{ minWidth: '220px' }}>
                    <li className="px-3 py-2 border-bottom mb-1 bg-light rounded-2">
                      <div className="fw-bold small text-dark">{profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` : 'Authenticated User'}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>{user.email}</div>
                      <span className="badge bg-primary-subtle text-primary rounded-pill mt-1" style={{ fontSize: '0.65rem' }}>
                        Role: {user.role}
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
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-akal-outline">
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="btn btn-akal-yellow">
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
