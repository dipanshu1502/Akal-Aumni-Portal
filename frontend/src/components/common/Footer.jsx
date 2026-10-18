import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Shield, Globe, Award, Share2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const { getSetting, isFeatureEnabled } = useSettings();

  const universityName = getSetting('university_name', 'AKAL UNIVERSITY');
  const footerDesc = getSetting('footer_description', 'A premier institution dedicated to academic excellence, research innovation, and value-based global leadership. Connecting thousands of proud graduates across continents.');
  const accreditation1 = getSetting('accreditation_line1', 'Akal University • NAAC Accredited Grade "A" • Established under Punjab Act No. 25 of 2015');
  const campusAddress = getSetting('campus_address', 'Talwandi Sabo, Bathinda, Punjab 151302, India');
  const contactEmail = getSetting('contact_email', 'alumni@akaluniversity.ac.in');
  const contactPhone = getSetting('contact_phone', '+91 1800-180-1234');
  const website = getSetting('university_website', 'https://akaluniversity.ac.in');
  const copyright = getSetting('copyright_text', `© ${new Date().getFullYear()} Akal University Alumni Association. All rights reserved.`);

  const linkedin = getSetting('social_linkedin', '');
  const youtube = getSetting('social_youtube', '');
  const twitter = getSetting('social_twitter', '');
  const instagram = getSetting('social_instagram', '');
  const facebook = getSetting('social_facebook', '');

  return (
    <footer id="akal-main-footer" className="text-white pt-5 pb-4 mt-5" style={{ backgroundColor: 'var(--akal-navy-dark)', borderTop: '3px solid var(--akal-yellow)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Col 1: University Identity */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="university-crest" style={{ width: '48px', height: '48px', fontSize: '22px' }}>
                AU
              </div>
              <div>
                <h5 className="mb-0 text-white fw-bold">{universityName}</h5>
                <span className="text-warning small text-uppercase fw-semibold" style={{ letterSpacing: '0.1em' }}>Alumni Association</span>
              </div>
            </div>
            <p className="text-light text-opacity-75 small pe-lg-4">
              {footerDesc}
            </p>
            <div className="d-flex align-items-center gap-2 text-warning small fw-semibold mb-3">
              <Award size={16} />
              <span>{accreditation1}</span>
            </div>

            {/* Social icons */}
            <div className="d-flex align-items-center gap-2 mt-2">
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="LinkedIn">
                  <span className="fw-bold small" style={{ fontSize: '12px' }}>in</span>
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="YouTube">
                  <span className="fw-bold small" style={{ fontSize: '12px' }}>YT</span>
                </a>
              )}
              {twitter && (
                <a href={twitter} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Twitter/X">
                  <span className="fw-bold small" style={{ fontSize: '12px' }}>𝕏</span>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Instagram">
                  <span className="fw-bold small" style={{ fontSize: '12px' }}>IG</span>
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light rounded-circle px-2 py-1" title="Facebook">
                  <span className="fw-bold small" style={{ fontSize: '12px' }}>fb</span>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-warning fw-bold text-uppercase mb-3 small" style={{ letterSpacing: '0.08em' }}>Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              {isFeatureEnabled('enable_public_directory', true) && <li><Link to="/directory" className="text-light text-decoration-none text-opacity-75 hover-warning">Alumni Directory</Link></li>}
              {isFeatureEnabled('enable_public_events', true) && <li><Link to="/events" className="text-light text-decoration-none text-opacity-75 hover-warning">Events & Reunions</Link></li>}
              {isFeatureEnabled('enable_public_jobs', true) && <li><Link to="/jobs" className="text-light text-decoration-none text-opacity-75 hover-warning">Career Opportunities</Link></li>}
              {isFeatureEnabled('enable_public_mentorship', true) && <li><Link to="/mentorship" className="text-light text-decoration-none text-opacity-75 hover-warning">Mentorship Hub</Link></li>}
              {isFeatureEnabled('enable_public_chapters', true) && <li><Link to="/chapters" className="text-light text-opacity-75 text-decoration-none">Global Chapters</Link></li>}
              {isFeatureEnabled('enable_public_stories', true) && <li><Link to="/stories" className="text-light text-opacity-75 text-decoration-none">Success Stories</Link></li>}
            </ul>
          </div>

          {/* Col 3: Portal Modules & Access */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-warning fw-bold text-uppercase mb-3 small" style={{ letterSpacing: '0.08em' }}>Alumni Engagement</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              <li><Link to="/register" className="text-light text-decoration-none text-opacity-75">Register as Alumni</Link></li>
              <li><Link to="/login" className="text-light text-decoration-none text-opacity-75">Student Login</Link></li>
              <li><Link to="/login" className="text-light text-decoration-none text-opacity-75">Admin Portal Access</Link></li>
              {isFeatureEnabled('enable_public_gallery', true) && <li><Link to="/news-gallery" className="text-light text-decoration-none text-opacity-75">Campus Media & News</Link></li>}
              <li><span className="badge bg-warning text-dark px-2 py-1 mt-1">Digital Alumni ID Support</span></li>
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-warning fw-bold text-uppercase mb-3 small" style={{ letterSpacing: '0.08em' }}>Alumni Office</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              <li className="d-flex align-items-start gap-2">
                <MapPin size={16} className="text-warning mt-1 flex-shrink-0" />
                <span>{campusAddress}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-warning flex-shrink-0" />
                <span>{contactEmail}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-warning flex-shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Globe size={16} className="text-warning flex-shrink-0" />
                <a href={website} target="_blank" rel="noreferrer" className="text-light text-opacity-75 text-decoration-none">{website.replace('https://', '')}</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-light text-opacity-50 gap-2">
          <div>
            {copyright}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Engagement</span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1 text-warning">
              Made with <Heart size={14} fill="currentColor" /> for Akal Alumni
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
