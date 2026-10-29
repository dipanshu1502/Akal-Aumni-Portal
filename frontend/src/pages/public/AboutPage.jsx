import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { BookOpen, MapPin, ShieldCheck, GraduationCap, Users, Sparkles, ArrowRight, Award, Globe, HeartHandshake, Target, ExternalLink } from 'lucide-react';

const DEFAULT_ABOUT_HTML = `
  <p><strong>Akal University</strong> is a premier institution dedicated to academic excellence, research innovation, and value-based global leadership.</p>
  <p>Established under Punjab Act No. 25 of 2015 and NAAC Accredited Grade "A", the university is located at Talwandi Sabo, Bathinda, Punjab 151302, India.</p>
  <p>The Akal University Alumni Portal connects thousands of proud graduates across continents — enabling alumni to reconnect with batchmates, mentor students, explore career opportunities, and celebrate institutional pride.</p>
`;

const DEFAULT_FACTS = `Established | Punjab Act No. 25 of 2015 | State Private University
Accreditation | NAAC Grade "A" | Quality Assured Academics
Campus | Talwandi Sabo, Bathinda | Punjab 151302, India
Alumni Network | Global Community | Chapters, Mentors & Careers`;

const DEFAULT_VALUES = `Academic Excellence | Research-driven learning that prepares graduates to lead in industry, academia and social change.
Value-Based Leadership | Seva, integrity and compassion — values every Akal graduate carries across the globe.
Global Community | Chapters, mentorship and careers connecting alumni across India and worldwide.`;

/** Parse "Title | Value | Note" lines */
const parseFacts = (raw) => String(raw || '')
  .split('\n').map((l) => l.trim()).filter(Boolean)
  .map((line) => {
    const [title = '', value = '', note = ''] = line.split('|').map((p) => p.trim());
    return { title, value: value || title, note };
  }).filter((f) => f.title);

/** Parse "Title | Description" lines */
const parseValues = (raw) => String(raw || '')
  .split('\n').map((l) => l.trim()).filter(Boolean)
  .map((line) => {
    const idx = line.indexOf('|');
    if (idx === -1) return { title: line, desc: '' };
    return { title: line.slice(0, idx).trim(), desc: line.slice(idx + 1).trim() };
  }).filter((v) => v.title);

// Single source of truth — Admin Site Customizer inhe pre-fill karta hai.
export const ABOUT_PAGE_DEFAULTS = {
  about_akal_university: DEFAULT_ABOUT_HTML.trim(),
  about_hero_badge: 'ABOUT US',
  about_hero_title: 'About Akal University',
  about_hero_subtitle: 'Excellence in education, research, and value-based leadership — and the alumni network that carries it across the globe.',
  about_facts: DEFAULT_FACTS,
  about_values: DEFAULT_VALUES,
  about_side_title: 'One network. Lifelong belonging.',
  about_side_desc: 'Reconnect with batchmates, mentor students, discover careers and celebrate pride.',
  about_cta_title: 'Be part of the Alumni Network',
  about_cta_desc: 'Get your verified digital alumni ID and unlock chapters, mentorship and careers.',
  about_hero_trust1: 'NAAC Grade A',
  about_hero_trust2: 'Estd. 2015',
  about_hero_trust3: 'Global Alumni',
  about_campus_short: 'Talwandi Sabo, Bathinda, Punjab',
  about_overview_label: 'University Overview',
  about_side_badge: 'ALUMNI PORTAL',
  about_btn_join: 'Join Network',
  about_btn_auaa: 'About AUAA',
  about_btn_directory: 'Explore Directory',
  about_btn_stories: 'Success Stories',
};

const AboutPage = () => {
  const { getSetting } = useSettings();
  const aboutContent = getSetting('about_akal_university', DEFAULT_ABOUT_HTML);
  const heroBadge = getSetting('about_hero_badge', 'ABOUT US');
  const heroTitle = getSetting('about_hero_title', 'About Akal University');
  const heroSubtitle = getSetting('about_hero_subtitle', 'Excellence in education, research, and value-based leadership — and the alumni network that carries it across the globe.');
  const facts = parseFacts(getSetting('about_facts', DEFAULT_FACTS)).map((f, i) => ({
    ...f, icon: [GraduationCap, ShieldCheck, MapPin, Users][i % 4],
  }));
  const values = parseValues(getSetting('about_values', DEFAULT_VALUES)).map((v, i) => ({
    ...v, icon: [Target, HeartHandshake, Globe][i % 3],
  }));
  const sideTitle = getSetting('about_side_title', 'One network. Lifelong belonging.');
  const sideDesc = getSetting('about_side_desc', 'Reconnect with batchmates, mentor students, discover careers and celebrate pride.');
  const ctaTitle = getSetting('about_cta_title', 'Be part of the Alumni Network');
  const ctaDesc = getSetting('about_cta_desc', 'Get your verified digital alumni ID and unlock chapters, mentorship and careers.');
  const trust1 = getSetting('about_hero_trust1', 'NAAC Grade A');
  const trust2 = getSetting('about_hero_trust2', 'Estd. 2015');
  const trust3 = getSetting('about_hero_trust3', 'Global Alumni');
  const campusShort = getSetting('about_campus_short', 'Talwandi Sabo, Bathinda, Punjab');
  const overviewLabel = getSetting('about_overview_label', 'University Overview');
  const sideBadge = getSetting('about_side_badge', 'ALUMNI PORTAL');
  const btnJoin = getSetting('about_btn_join', 'Join Network');
  const btnAuaa = getSetting('about_btn_auaa', 'About AUAA');
  const btnDirectory = getSetting('about_btn_directory', 'Explore Directory');
  const btnStories = getSetting('about_btn_stories', 'Success Stories');
  const cardTitle = getSetting('university_name', 'Akal University');

  return (
    <div className="about-page bg-white min-vh-100">

      {/* HERO */}
      <section className="py-5 position-relative text-white overflow-hidden" style={{ backgroundColor: 'var(--akal-navy)', borderBottom: '3px solid var(--akal-yellow)' }}>
        <div className="container position-relative z-1 py-3">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-warning bg-opacity-20 border border-warning border-opacity-40 text-warning small fw-bold mb-3">
                <Sparkles size={14} /><span>{heroBadge}</span>
              </div>
              <h1 className="display-5 fw-bold text-white mb-3">{heroTitle}</h1>
              <p className="lead text-white-50 mb-4" style={{ fontSize: '1.08rem', maxWidth: '640px' }}>
                {heroSubtitle}
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-akal-yellow px-4 py-2">{btnJoin} <ArrowRight size={17} /></Link>
                <Link to="/auaa" className="btn btn-akal-outline-white px-4 py-2">{btnAuaa} <ExternalLink size={16} /></Link>
              </div>
              <div className="d-flex align-items-center gap-4 mt-4 pt-3 border-top border-white border-opacity-15 small text-white-50 flex-wrap">
                <span className="d-flex align-items-center gap-2"><ShieldCheck size={17} className="text-warning" /> {trust1}</span>
                <span className="d-flex align-items-center gap-2"><Award size={17} className="text-warning" /> {trust2}</span>
                <span className="d-flex align-items-center gap-2"><Globe size={17} className="text-warning" /> {trust3}</span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="akal-card p-4 bg-white text-dark shadow-sm border-akal-border-grey">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="university-crest" style={{ width: '38px', height: '38px', fontSize: '15px' }}>AU</div>
                  <div><h6 className="mb-0 fw-bold text-akal-navy">{cardTitle}</h6><span className="text-akal-muted small" style={{ fontSize: '0.72rem' }}>{campusShort}</span></div>
                </div>
                <div className="row g-2 text-center">
                  {facts.map((f) => (
                    <div key={f.title} className="col-6">
                      <div className="p-2 border border-akal-border-grey rounded-3 bg-white h-100">
                        <f.icon size={20} className="text-akal-blue mb-1" />
                        <div className="fw-bold text-akal-navy small">{f.value}</div>
                        <div className="text-akal-muted" style={{ fontSize: '0.68rem' }}>{f.title} - {f.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="akal-card p-4 p-lg-5 h-100 bg-white border-akal-border-grey">
              <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-3">
                <BookOpen size={16} /><span>{overviewLabel}</span>
              </div>
              <div style={{ lineHeight: 1.85, color: 'var(--akal-text-primary)', fontSize: '1.02rem' }} dangerouslySetInnerHTML={{ __html: aboutContent }} />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="akal-card p-4 d-flex flex-column gap-3 position-sticky border-akal-border-grey" style={{ top: '90px', backgroundColor: 'var(--akal-navy)', color: '#FFFFFF' }}>
              <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill align-self-start">{sideBadge}</span>
              <h4 className="fw-bold text-white mb-0">{sideTitle}</h4>
              <p className="text-white-50 small mb-1">{sideDesc}</p>
              <div className="d-flex flex-column gap-2 mt-1">
                <Link to="/directory" className="btn btn-akal-yellow w-100 justify-content-center">{btnDirectory} <ArrowRight size={16} /></Link>
                <Link to="/stories" className="btn btn-akal-outline-white w-100 justify-content-center">{btnStories}</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {values.map((v) => (
            <div key={v.title} className="col-md-4">
              <div className="akal-card p-4 h-100 bg-white border-akal-border-grey">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px', background: 'var(--akal-blue-soft)', color: 'var(--akal-blue)' }}>
                  <v.icon size={22} />
                </div>
                <h5 className="fw-bold text-akal-navy mb-2">{v.title}</h5>
                <p className="text-akal-secondary small mb-0" style={{ lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="py-4 mt-5 px-4 px-lg-5 rounded-4 text-white text-center position-relative overflow-hidden" style={{ backgroundColor: 'var(--akal-navy)', borderTop: '3px solid var(--akal-yellow)' }}>
          <div className="university-crest mx-auto mb-3" style={{ width: '52px', height: '52px', fontSize: '20px' }}>AU</div>
          <h2 className="fw-bold text-white mb-2">{ctaTitle}</h2>
          <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: '620px' }}>{ctaDesc}</p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/register" className="btn btn-akal-yellow px-4 py-2">{btnJoin} <ArrowRight size={16} /></Link>
            <Link to="/directory" className="btn btn-akal-outline-white px-4 py-2">{btnDirectory}</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;