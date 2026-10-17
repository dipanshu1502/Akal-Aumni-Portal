import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { BookOpen, MapPin, ShieldCheck, GraduationCap, Users, Sparkles, ArrowRight } from 'lucide-react';

const DEFAULT_ABOUT_HTML = `
  <p><strong>Akal University</strong> is a premier institution dedicated to academic excellence, research innovation, and value-based global leadership.</p>
  <p>Established under Punjab Act No. 25 of 2015 and NAAC Accredited Grade "A", the university is located at Talwandi Sabo, Bathinda, Punjab 151302, India.</p>
  <p>The Akal University Alumni Portal connects thousands of proud graduates across continents — enabling alumni to reconnect with batchmates, mentor students, explore career opportunities, and celebrate institutional pride.</p>
  <p><em>This content is managed by the Super Admin from Admin Dashboard → System Settings → About University.</em></p>
`;

const AboutPage = () => {
  const { getSetting } = useSettings();
  const aboutContent = getSetting('about_akal_university', DEFAULT_ABOUT_HTML);

  const facts = [
    { icon: GraduationCap, title: 'Established', value: 'Punjab Act No. 25 of 2015', note: 'State Private University' },
    { icon: ShieldCheck, title: 'Accreditation', value: 'NAAC Grade "A"', note: 'Quality Assured Academics' },
    { icon: MapPin, title: 'Campus', value: 'Talwandi Sabo, Bathinda', note: 'Punjab 151302, India' },
    { icon: Users, title: 'Alumni Network', value: 'Global Community', note: 'Chapters, Mentors & Careers' },
  ];

  return (
    <div className="about-page py-4">
      <div className="container">
        {/* Page Header */}
        <div className="rounded-4 p-4 p-lg-5 mb-4 text-white shadow-sm" style={{ background: 'var(--grad-primary, linear-gradient(135deg, #087BB5, #172333))' }}>
          <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
            <Sparkles size={16} />
            <span>ABOUT US</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">About Akal University</h1>
          <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '760px' }}>
            Excellence in education, research, and value-based leadership — and the alumni network that carries it across the globe.
          </p>
        </div>

        {/* Admin-Editable Main Content */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-3">
            <BookOpen size={16} />
            <span>University Overview</span>
          </div>
          <div style={{ lineHeight: 1.8, color: '#2b3a4a', fontSize: '1.02rem' }} dangerouslySetInnerHTML={{ __html: aboutContent }} />
        </div>

        {/* Quick Facts */}
        <div className="row g-4 mb-4">
          {facts.map((fact) => (
            <div key={fact.title} className="col-md-6 col-lg-3">
              <div className="akal-card p-4 h-100 text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '52px', height: '52px', background: 'rgba(8,123,181,0.12)' }}>
                  <fact.icon size={24} className="text-primary" />
                </div>
                <div className="text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: '0.72rem' }}>{fact.title}</div>
                <div className="fw-bold text-dark">{fact.value}</div>
                <div className="text-muted small mt-1">{fact.note}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-4 p-4 p-lg-5 border d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h5 className="fw-bold text-dark mb-1">Be part of the Akal University Alumni Network</h5>
            <p className="text-muted small mb-0">Reconnect with batchmates, mentor students, and explore career opportunities.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/register" className="btn btn-akal-yellow fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2">
              Join Network <ArrowRight size={16} />
            </Link>
            <Link to="/directory" className="btn btn-akal-outline fw-bold rounded-pill px-4 py-2">
              Explore Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;