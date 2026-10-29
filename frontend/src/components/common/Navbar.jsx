import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import DigitalIdModal from "./DigitalIdModal";
import {
  LogIn,
  LogOut,
  User,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  ChevronDown,
  Globe,
  HeartHandshake,
  Users,
  Sparkles,
  Calendar,
  Briefcase,
  Newspaper,
  Heart,
  Landmark
} from "lucide-react";

const Navbar = () => {
  const { user, profile, logout, isAuthenticated, isAlumni, isStudent, isAdmin, isSuperAdmin } = useAuth();
  const { isFeatureEnabled } = useSettings();
  const [showIdModal, setShowIdModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = () => {
    const el = document.getElementById("navbarContent");
    if (el && el.classList.contains("show") && window.bootstrap) {
      window.bootstrap.Collapse.getOrCreateInstance(el).hide();
    }
  };

  // 1. About Dropdown Links
  const aboutLinks = [
    {
      to: "/about",
      title: "About Akal University",
      desc: "Heritage, leadership & NAAC 'A' accreditation",
      icon: <Landmark size={18} />
    },
    {
      to: "/auaa",
      title: "Alumni Association (AUAA)",
      desc: "Association charter, council & mission",
      icon: <ShieldCheck size={18} />
    },
    isFeatureEnabled("enable_public_chapters", true) && {
      to: "/chapters",
      title: "Regional & Global Chapters",
      desc: "Connect with city-based alumni networks worldwide",
      icon: <Globe size={18} />
    }
  ].filter(Boolean);

  // 2. Network & Mentorship Links
  const networkLinks = [
    isFeatureEnabled("enable_public_directory", true) && {
      to: "/directory",
      title: "Alumni Directory",
      desc: "Search verified graduates, batchmates & faculty",
      icon: <Users size={18} />
    },
    isFeatureEnabled("enable_public_mentorship", true) && {
      to: "/mentorship",
      title: "Mentorship Hub",
      desc: "1-on-1 career guidance, resume reviews & mocks",
      icon: <HeartHandshake size={18} />
    },
    isFeatureEnabled("enable_public_stories", true) && {
      to: "/stories",
      title: "Success Stories",
      desc: "Inspiring career milestones of distinguished Akalites",
      icon: <Sparkles size={18} />
    }
  ].filter(Boolean);

  // 3. Events & Careers Links
  const opportunitiesLinks = [
    isFeatureEnabled("enable_public_events", true) && {
      to: "/events",
      title: "Events & Reunions",
      desc: "Campus meets, annual reunions & webinars",
      icon: <Calendar size={18} />
    },
    isFeatureEnabled("enable_public_jobs", true) && {
      to: "/jobs",
      title: "Career & Job Board",
      desc: "Exclusive openings & internships for alumni",
      icon: <Briefcase size={18} />
    },
    isFeatureEnabled("enable_public_gallery", true) && {
      to: "/news-gallery",
      title: "Campus News & Gallery",
      desc: "Press releases, event photos & campus memories",
      icon: <Newspaper size={18} />
    }
  ].filter(Boolean);

  const isAboutActive = aboutLinks.some(l => location.pathname === l.to);
  const isNetworkActive = networkLinks.some(l => location.pathname.startsWith(l.to));
  const isOpportunitiesActive = opportunitiesLinks.some(l => location.pathname.startsWith(l.to));

  return (
    <>
      <nav
        id="akal-main-navbar"
        className={`navbar navbar-expand-xl akal-navbar sticky-top ${isScrolled ? "shadow-sm" : ""}`}
      >
        <div className="container-fluid px-3 px-lg-4">
          {/* Logo & University Title */}
          <Link
            to="/"
            className="university-logo-container navbar-brand d-flex align-items-center gap-2 text-decoration-none py-1"
            onClick={closeMobileMenu}
          >
            <img
              className="university-logo-image"
              src="/Akal%20Logo.png"
              alt="Akal University Alumni Association"
            />
            <div className="university-title-text">
              <div className="university-title-main">AKAL UNIVERSITY</div>
              <div className="university-title-sub">Alumni Association</div>
            </div>
          </Link>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler border-0 p-2 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
          </button>

          {/* Navigation Links and Action Buttons */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 ms-xl-3 gap-1 align-items-xl-center">
              {/* 1. Home Direct Link */}
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `akal-nav-link nav-link ${isActive ? "active-nav" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  Home
                </NavLink>
              </li>

              {/* 2. About AUAA Dropdown */}
              {aboutLinks.length > 0 && (
                <li className="nav-item dropdown akal-nav-dropdown">
                  <button
                    className={`akal-nav-link nav-link dropdown-toggle d-inline-flex align-items-center border-0 bg-transparent ${isAboutActive ? "has-dropdown-active" : ""}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span>About AUAA</span>
                    <ChevronDown size={14} className="nav-chevron-icon ms-1" />
                  </button>
                  <ul className="dropdown-menu akal-nav-dropdown-menu shadow-lg">
                    {aboutLinks.map((link) => {
                      const isItemActive = location.pathname === link.to;
                      return (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className={`akal-nav-dropdown-item ${isItemActive ? "active-item" : ""}`}
                            onClick={closeMobileMenu}
                          >
                            <div className="akal-nav-dropdown-icon">
                              {link.icon}
                            </div>
                            <div>
                              <div className="akal-nav-dropdown-title">{link.title}</div>
                              <div className="akal-nav-dropdown-desc">{link.desc}</div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {/* 3. Network & Mentorship Dropdown */}
              {networkLinks.length > 0 && (
                <li className="nav-item dropdown akal-nav-dropdown">
                  <button
                    className={`akal-nav-link nav-link dropdown-toggle d-inline-flex align-items-center border-0 bg-transparent ${isNetworkActive ? "has-dropdown-active" : ""}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span>Network & Mentorship</span>
                    <ChevronDown size={14} className="nav-chevron-icon ms-1" />
                  </button>
                  <ul className="dropdown-menu akal-nav-dropdown-menu shadow-lg">
                    {networkLinks.map((link) => {
                      const isItemActive = location.pathname.startsWith(link.to);
                      return (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className={`akal-nav-dropdown-item ${isItemActive ? "active-item" : ""}`}
                            onClick={closeMobileMenu}
                          >
                            <div className="akal-nav-dropdown-icon">
                              {link.icon}
                            </div>
                            <div>
                              <div className="akal-nav-dropdown-title">{link.title}</div>
                              <div className="akal-nav-dropdown-desc">{link.desc}</div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {/* 4. Events & Careers Dropdown */}
              {opportunitiesLinks.length > 0 && (
                <li className="nav-item dropdown akal-nav-dropdown">
                  <button
                    className={`akal-nav-link nav-link dropdown-toggle d-inline-flex align-items-center border-0 bg-transparent ${isOpportunitiesActive ? "has-dropdown-active" : ""}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span>Events & Careers</span>
                    <ChevronDown size={14} className="nav-chevron-icon ms-1" />
                  </button>
                  <ul className="dropdown-menu akal-nav-dropdown-menu shadow-lg">
                    {opportunitiesLinks.map((link) => {
                      const isItemActive = location.pathname.startsWith(link.to);
                      return (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className={`akal-nav-dropdown-item ${isItemActive ? "active-item" : ""}`}
                            onClick={closeMobileMenu}
                          >
                            <div className="akal-nav-dropdown-icon">
                              {link.icon}
                            </div>
                            <div>
                              <div className="akal-nav-dropdown-title">{link.title}</div>
                              <div className="akal-nav-dropdown-desc">{link.desc}</div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {/* 5. Giving Back Direct Link */}
              <li className="nav-item">
                <NavLink
                  to="/donations"
                  className={({ isActive }) =>
                    `akal-nav-link nav-link d-inline-flex align-items-center gap-1 ${isActive ? "active-nav" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Heart size={14} style={{ fill: "var(--akal-yellow)", color: "var(--akal-yellow)" }} />
                  <span>Giving Back</span>
                </NavLink>
              </li>
            </ul>

            {/* Right Action Controls: User Chip or Login/Register */}
            <div className="d-flex align-items-center gap-2 flex-nowrap ms-xl-auto mt-2 mt-xl-0">
              {isAuthenticated ? (
                <div className="dropdown">
                  <div
                    className="akal-user-chip d-flex align-items-center gap-2 rounded-3 px-3 py-1 text-decoration-none dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="akal-avatar-ring">
                      <div className="akal-avatar-inner" style={{ width: 28, height: 28, backgroundColor: "var(--akal-blue)" }}>
                        {user.first_name?.[0] || "U"}{user.last_name ? user.last_name[0] : ""}
                      </div>
                    </div>
                    <div className="d-flex flex-column text-start">
                      <div className="user-chip-name">{profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}` : (user.first_name || "User")}</div>
                      <div className="user-chip-role">{(user.role || "").toUpperCase()}</div>
                    </div>
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end akal-dropdown p-2 mt-1 shadow-lg">
                    {isAlumni && (
                      <>
                        <li>
                          <Link to="/alumni/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={closeMobileMenu}>
                            <User size={16} className="text-akal-blue" />
                            Alumni Dashboard
                          </Link>
                        </li>
                        <li>
                          <button onClick={() => { setShowIdModal(true); closeMobileMenu(); }} className="dropdown-item d-flex align-items-center gap-2 py-2 w-100 text-start">
                            <CreditCard size={16} className="text-warning" />
                            Digital Alumni ID
                          </button>
                        </li>
                      </>
                    )}
                    {isStudent && (
                      <li>
                        <Link to="/student/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={closeMobileMenu}>
                          <GraduationCap size={16} className="text-akal-blue" />
                          Student Dashboard
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={closeMobileMenu}>
                          <ShieldCheck size={16} className="text-akal-blue" />
                          {isSuperAdmin ? "Super Admin Console" : "Admin Management"}
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger w-100 text-start">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 flex-nowrap">
                  <Link to="/login" className="btn btn-akal-nav-outline btn-sm px-3 py-1" onClick={closeMobileMenu}>
                    <LogIn size={14} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="btn btn-akal-yellow btn-sm px-3 py-1" onClick={closeMobileMenu}>
                    <UserPlus size={14} />
                    <span>Join Network</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showIdModal && (
        <DigitalIdModal onClose={() => setShowIdModal(false)} />
      )}
    </>
  );
};

export default Navbar;
