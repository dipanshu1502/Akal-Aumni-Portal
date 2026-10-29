import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Heart, Shield, Globe, Award } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const Footer = () => {
  const { getSetting, isFeatureEnabled } = useSettings();

  const universityName = getSetting("university_name", "AKAL UNIVERSITY");
  const footerDesc = getSetting("footer_description", "A premier institution dedicated to academic excellence, research innovation, and value-based global leadership. Connecting thousands of proud graduates across continents.");
  const accreditation1 = getSetting("accreditation_line1", "Akal University • NAAC Accredited Grade 'A' • Established under Punjab Act No. 25 of 2015");
  const campusAddress = getSetting("campus_address", "Talwandi Sabo, Bathinda, Punjab 151302, India");
  const contactEmail = getSetting("contact_email", "alumni@akaluniversity.ac.in");
  const contactPhone = getSetting("contact_phone", "+91 1800-180-1234");
  const website = getSetting("university_website", "https://akaluniversity.ac.in");
  const copyright = getSetting("copyright_text", `© ${new Date().getFullYear()} Akal University Alumni Association. All rights reserved.`);

  const linkedin = getSetting("social_linkedin", "");
  const youtube = getSetting("social_youtube", "");
  const twitter = getSetting("social_twitter", "");
  const instagram = getSetting("social_instagram", "");
  const facebook = getSetting("social_facebook", "");

  return (
    <footer id="akal-main-footer" className="text-white pt-5 pb-4 mt-5 bg-akal-navy border-top border-akal-yellow border-top-3">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Col 1: University Identity */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="university-crest" style={{ width: "44px", height: "44px", fontSize: "18px" }}>
                AU
              </div>
              <div>
                <h5 className="mb-0 text-white fw-bold">{universityName}</h5>
                <span className="text-akal-yellow small text-uppercase fw-semibold" style={{ letterSpacing: "0.1em" }}>Alumni Association</span>
              </div>
            </div>
            <p className="text-akal-muted small pe-lg-4 opacity-80">
              {footerDesc}
            </p>
            <div className="d-flex align-items-center gap-2 text-akal-yellow small fw-semibold mb-3">
              <Award size={16} />
              <span>{accreditation1}</span>
            </div>

            {/* Social icons */}
            <div className="d-flex align-items-center gap-2 mt-2">
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="LinkedIn">
                  <span className="fw-bold small" style={{ fontSize: "12px" }}>in</span>
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="YouTube">
                  <span className="fw-bold small" style={{ fontSize: "12px" }}>YT</span>
                </a>
              )}
              {twitter && (
                <a href={twitter} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Twitter/X">
                  <span className="fw-bold small" style={{ fontSize: "12px" }}>X</span>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Instagram">
                  <span className="fw-bold small" style={{ fontSize: "12px" }}>in</span>
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Facebook">
                  <span className="fw-bold small" style={{ fontSize: "12px" }}>f</span>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-akal-yellow fw-bold text-uppercase mb-3 small" style={{ letterSpacing: "0.08em" }}>Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-akal-muted opacity-80">
              <li><Link to="/" className="text-akal-white text-decoration-none hover-text-akal-blue">Home</Link></li>
              <li><Link to="/about" className="text-akal-white text-decoration-none hover-text-akal-blue">About Us</Link></li>
              <li><Link to="/auaa" className="text-akal-white text-decoration-none hover-text-akal-blue">AUAA Association</Link></li>
              {isFeatureEnabled("enable_public_directory", true) && <li><Link to="/directory" className="text-akal-white text-decoration-none hover-text-akal-blue">Alumni Directory</Link></li>}
              {isFeatureEnabled("enable_public_events", true) && <li><Link to="/events" className="text-akal-white text-decoration-none hover-text-akal-blue">Events</Link></li>}
              <li><Link to="/donations" className="text-akal-white text-decoration-none hover-text-akal-blue">Donations</Link></li>
              {isFeatureEnabled("enable_public_mentorship", true) && <li><Link to="/mentorship" className="text-akal-white text-decoration-none hover-text-akal-blue">Mentorship Hub</Link></li>}
              {isFeatureEnabled("enable_public_chapters", true) && <li><Link to="/chapters" className="text-akal-white text-decoration-none hover-text-akal-blue">Global Chapters</Link></li>}
              {isFeatureEnabled("enable_public_stories", true) && <li><Link to="/stories" className="text-akal-white text-decoration-none hover-text-akal-blue">Success Stories</Link></li>}
            </ul>
          </div>

          {/* Col 3: Portal Modules & Access */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-akal-yellow fw-bold text-uppercase mb-3 small" style={{ letterSpacing: "0.08em" }}>Alumni Engagement</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-akal-muted opacity-80">
              <li><Link to="/register" className="text-akal-white text-decoration-none hover-text-akal-blue">Register as Alumni</Link></li>
              <li><Link to="/login" className="text-akal-white text-decoration-none hover-text-akal-blue">Student Login</Link></li>
              <li><Link to="/login" className="text-akal-white text-decoration-none hover-text-akal-blue">Admin Portal Access</Link></li>
              {isFeatureEnabled("enable_public_gallery", true) && <li><Link to="/news-gallery" className="text-akal-white text-decoration-none hover-text-akal-blue">Campus Media & News</Link></li>}
              <li><span className="badge bg-akal-blue text-white px-2 py-1 mt-1 small">Digital Alumni ID Support</span></li>
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-akal-yellow fw-bold text-uppercase mb-3 small" style={{ letterSpacing: "0.08em" }}>Alumni Office</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-akal-muted opacity-80">
              <li className="d-flex align-items-start gap-2">
                <MapPin size={16} className="text-akal-yellow mt-1 flex-shrink-0" />
                <span>{campusAddress}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-akal-yellow flex-shrink-0" />
                <span>{contactEmail}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-akal-yellow flex-shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Globe size={16} className="text-akal-yellow flex-shrink-0" />
                <a href={website} target="_blank" rel="noreferrer" className="text-akal-white text-decoration-none hover-text-akal-blue">{website.replace("https://", "")}</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-akal-border-grey my-4 opacity-50" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-akal-muted opacity-60 gap-2">
          <div>
            {copyright}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-akal-white">Privacy Policy</span>
            <span>•</span>
            <span className="text-akal-white">Terms of Engagement</span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1 text-akal-yellow">
              Made with <Heart size={14} fill="currentColor" /> for Akal Alumni
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

