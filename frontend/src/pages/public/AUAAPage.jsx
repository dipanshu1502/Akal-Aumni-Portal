
import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, ShieldCheck, Users, Globe, ArrowRight, ExternalLink, Target, CheckCircle2, Crown, HeartHandshake, BadgeCheck, Landmark } from 'lucide-react';

const DEFAULT_OBJECTIVES = `To foster the spirit of brotherhood amongst the alumni of the University
To provide platform to the Alumni to stay connected with their Alma Mater for mutual development and benefits.
To harness the enthusiasm and willingness of members who are willing to take on organizational initiatives and sustain it.
To mobilize financial resources for development and growth of the University.
To disseminate information about activities and development of the University to the alumni members through alumni Website, Facebook group, Linkedin group, WhatsApp group etc.
To involve alumni in strengthening the placement activities of the University.`;

const DEFAULT_ELIGIBILITY = `Persons who are awarded UG/PG/Ph.D. degrees by the Akal University, Talwandi Sabo.
Persons who have obtained diploma of at least one year duration.
Members of the teaching staff of the University even though they may not be graduates of this University.
Graduates of other Universities (Indian or Foreign) on whom membership is conferred by the Executive Council of the Association.
All Students of the University.`;

const DEFAULT_FEES = `Life Member | Rs. 1000/- | NRI/Overseas: US$ 100 or equivalent
Donor Member | Rs. 21,000/- or more | NRI/Overseas: US$ 1000 or equivalent
Patron | Rs. 21,000/- or more | NRI/Overseas: US$ 1,000 or equivalent, with approval of the Chief Patron
Honorary Member | Conferred membership | Membership is conferred by the Association.`;

const DEFAULT_BEARERS = `Vice-Chancellor – Ex-officio || The Chief Patron shall be the custodian of all assets of the Association. || He shall preside over the all the meetings of the Association and all functions that may be organised by the Association. || He may call special meetings of the Executive Council/General Body of the Association as and when required or on a written request signed by at least 10 members. || The president shall perform the duties and functions of the Chief Patron in his absence. || He shall perform such other duties and functions as may be entrusted to him by the Chief Patron or the Executive Council.
Dean, Alumni Relations – Ex-officio || He will be the custodian of all the records and documents of the Association and maintain a property register and all such registers as may be necessary in connection with the work of the Association. || He will maintain an up-to-date register of members and of all subscriptions and donations. || He is authorized to call and arrange meetings of the Executive Council and the Association and record the minutes of their meetings. || He will represent the Association in all legal proceedings and sign all legal documents on behalf of the Association.
Finance Officer – Ex-officio || He will assist the Secretary in the administrative matters, in conducting activities of the Association and functions regarding finances/accounts of the Association. || He will perform such other duties and functions as may be entrusted to him by the Executive Council.`;

const DEFAULT_ACCOUNTS = `The Chief Patron and Secretary jointly will be responsible for the safe custody of the funds/finances of the Association and to operate bank account jointly.
The Secretary will be the custodian of all the records and documents related to the Bank Account and prepare Balance Sheets of for each year that has to be presented for approval in the Executive Council/General Body of the Association.`;

const DEFAULT_OVERVIEW_HTML = `<p>Since 2015 more than 700 students have graduated from Akal University and many of them are pursuing careers in the social sector. Through the establishment of Akal University Alumni Association, the University plans to provide a platform to the entire alumni, who after acquiring education and knowledge from here, are going to achieve glorious heights in different fields.</p><p>The strong ties between alumni and their alma mater are all the more relevant and vital given the University's vision to contribute to social change.</p>`;

/** One item per non-empty line */
const parseLines = (raw) => String(raw || '').split('\n').map((l) => l.trim()).filter(Boolean);
/** "Title | Fee | Detail" lines */
const parseFees = (raw) => parseLines(raw).map((line) => {
  const [title = '', fee = '', ...rest] = line.split('|').map((p) => p.trim());
  return { title, fee, detail: rest.join(' | ') };
}).filter((f) => f.title);
/** "Title || Duty || Duty..." lines */
const parseBearers = (raw) => parseLines(raw).map((line) => {
  const [title = '', ...duties] = line.split('||').map((p) => p.trim());
  return { title, duties: duties.filter(Boolean) };
}).filter((b) => b.title);

// Single source of truth — Admin Site Customizer inhe pre-fill karta hai.
export const AUAA_PAGE_DEFAULTS = {
  auaa_hero_badge: 'AUAA · ABOUT US',
  auaa_hero_title: 'Akal University Alumni Association',
  auaa_hero_subtitle: 'Connecting alumni with their alma mater and supporting the growth of the University community since 2015.',
  auaa_official_url: 'https://auts.ac.in/akal-alumni-association/',
  auaa_overview_html: DEFAULT_OVERVIEW_HTML,
  auaa_objectives: DEFAULT_OBJECTIVES,
  auaa_eligibility: DEFAULT_ELIGIBILITY,
  auaa_eligibility_note: 'All Former Vice-Chancellors and former Registrars will be members of the Association.',
  auaa_fees: DEFAULT_FEES,
  auaa_fee_note: 'Fee details are reproduced from the official page. Please verify current fees with the University before making any payment.',
  auaa_bearers: DEFAULT_BEARERS,
  auaa_accounts: DEFAULT_ACCOUNTS,
  auaa_cta_title: 'Akal University Alumni Association',
  auaa_cta_desc: 'Visit the official University page for membership information and the latest updates.',
  auaa_trust1: 'Registered Association',
  auaa_trust2: '700+ Graduates',
  auaa_trust3: 'Global Network',
  auaa_nav_overview: 'Overview',
  auaa_nav_objectives: 'Objectives',
  auaa_nav_membership: 'Membership',
  auaa_nav_fees: 'Fees',
  auaa_nav_bearers: 'Office Bearers',
  auaa_label_overview: 'Overview',
  auaa_label_objectives: 'Aims and Objectives',
  auaa_label_membership: 'Membership',
  auaa_label_categories: 'Categories of Membership',
  auaa_label_feedetails: 'Membership Fee Details',
  auaa_label_bearers: 'Office Bearers',
  auaa_label_accounts: 'Accounts',
  auaa_membership_intro: 'The following categories of persons shall be entitled to be enrolled as members of the Association:',
  auaa_note_label: 'Note:',
  auaa_cat1: 'Patron',
  auaa_cat2: 'Donor Members',
  auaa_cat3: 'Life Members',
  auaa_btn_member: 'Become a Member',
  auaa_btn_official: 'Official Page',
  auaa_btn_membership: 'Official Membership Page',
  auaa_btn_visit: 'Visit Official Website',
  auaa_btn_join: 'Join Network',
};

const AUAAPage = () => {
  const { getSetting } = useSettings();
  const heroBadge = getSetting('auaa_hero_badge', 'AUAA · ABOUT US');
  const heroTitle = getSetting('auaa_hero_title', 'Akal University Alumni Association');
  const heroSubtitle = getSetting('auaa_hero_subtitle', 'Connecting alumni with their alma mater and supporting the growth of the University community since 2015.');
  const officialUrl = getSetting('auaa_official_url', 'https://auts.ac.in/akal-alumni-association/');
  const overviewHtml = getSetting('auaa_overview_html', DEFAULT_OVERVIEW_HTML);
  const objectives = parseLines(getSetting('auaa_objectives', DEFAULT_OBJECTIVES));
  const membershipEligibility = parseLines(getSetting('auaa_eligibility', DEFAULT_ELIGIBILITY));
  const eligibilityNote = getSetting('auaa_eligibility_note', 'All Former Vice-Chancellors and former Registrars will be members of the Association.');
  const membershipFees = parseFees(getSetting('auaa_fees', DEFAULT_FEES));
  const feeNote = getSetting('auaa_fee_note', 'Fee details are reproduced from the official page. Please verify current fees with the University before making any payment.');
  const officeBearers = parseBearers(getSetting('auaa_bearers', DEFAULT_BEARERS));
  const accounts = parseLines(getSetting('auaa_accounts', DEFAULT_ACCOUNTS));
  const ctaTitle = getSetting('auaa_cta_title', 'Akal University Alumni Association');
  const ctaDesc = getSetting('auaa_cta_desc', 'Visit the official University page for membership information and the latest updates.');
  const trust1 = getSetting('auaa_trust1', 'Registered Association');
  const trust2 = getSetting('auaa_trust2', '700+ Graduates');
  const trust3 = getSetting('auaa_trust3', 'Global Network');
  const navOverview = getSetting('auaa_nav_overview', 'Overview');
  const navObjectives = getSetting('auaa_nav_objectives', 'Objectives');
  const navMembership = getSetting('auaa_nav_membership', 'Membership');
  const navFees = getSetting('auaa_nav_fees', 'Fees');
  const navBearers = getSetting('auaa_nav_bearers', 'Office Bearers');
  const labelOverview = getSetting('auaa_label_overview', 'Overview');
  const labelObjectives = getSetting('auaa_label_objectives', 'Aims and Objectives');
  const labelMembership = getSetting('auaa_label_membership', 'Membership');
  const labelCategories = getSetting('auaa_label_categories', 'Categories of Membership');
  const labelFeeDetails = getSetting('auaa_label_feedetails', 'Membership Fee Details');
  const labelBearers = getSetting('auaa_label_bearers', 'Office Bearers');
  const labelAccounts = getSetting('auaa_label_accounts', 'Accounts');
  const membershipIntro = getSetting('auaa_membership_intro', 'The following categories of persons shall be entitled to be enrolled as members of the Association:');
  const noteLabel = getSetting('auaa_note_label', 'Note:');
  const cat1 = getSetting('auaa_cat1', 'Patron');
  const cat2 = getSetting('auaa_cat2', 'Donor Members');
  const cat3 = getSetting('auaa_cat3', 'Life Members');
  const btnMember = getSetting('auaa_btn_member', 'Become a Member');
  const btnOfficial = getSetting('auaa_btn_official', 'Official Page');
  const btnMembership = getSetting('auaa_btn_membership', 'Official Membership Page');
  const btnVisit = getSetting('auaa_btn_visit', 'Visit Official Website');
  const btnJoin = getSetting('auaa_btn_join', 'Join Network');
  return (
    <div className="aua-page bg-white min-vh-100">
      {/* HERO — Official University Style */}
      <section className="py-5 position-relative text-white overflow-hidden" style={{ backgroundColor: 'var(--akal-navy)', borderBottom: '3px solid var(--akal-yellow)' }}>
        <div className="container position-relative z-1 py-3">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-warning bg-opacity-20 border border-warning border-opacity-40 text-warning small fw-bold mb-3">
            <Sparkles size={14} /><span>{heroBadge}</span>
          </div>
          <h1 className="display-5 fw-bold text-white mb-3" style={{ lineHeight: 1.15 }}>{heroTitle}</h1>
          <p className="lead text-white-50 mb-4" style={{ maxWidth: '760px', fontSize: '1.08rem' }}>
            {heroSubtitle}
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-akal-yellow px-4 py-2">{btnMember} <ArrowRight size={17} /></Link>
          </div>
          <div className="d-flex align-items-center gap-4 mt-4 pt-3 border-top border-white border-opacity-15 small text-white-50 flex-wrap">
            <span className="d-flex align-items-center gap-2"><ShieldCheck size={17} className="text-warning" /> {trust1}</span>
            <span className="d-flex align-items-center gap-2"><Users size={17} className="text-warning" /> {trust2}</span>
            <span className="d-flex align-items-center gap-2"><Globe size={17} className="text-warning" /> {trust3}</span>
          </div>
        </div>
      </section>

      {/* QUICK NAV PILLS */}
      <div className="border-bottom bg-white position-sticky" style={{ top: '0', zIndex: 5 }}>
        <div className="container d-flex gap-2 py-2 overflow-auto small fw-semibold">
          <a href="#aua-overview" className="text-decoration-none text-primary text-nowrap px-2">{navOverview}</a>
          <a href="#aua-objectives" className="text-decoration-none text-muted text-nowrap px-2">{navObjectives}</a>
          <a href="#aua-membership" className="text-decoration-none text-muted text-nowrap px-2">{navMembership}</a>
          <a href="#aua-fees" className="text-decoration-none text-muted text-nowrap px-2">{navFees}</a>
          <a href="#aua-bearers" className="text-decoration-none text-muted text-nowrap px-2">{navBearers}</a>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Overview */}
        <section id="aua-overview" className="mb-5" style={{ scrollMarginTop: '70px' }}>
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <Landmark size={16} /><span>{labelOverview}</span>
          </div>
          <div className="akal-card p-4 p-md-5" style={{ borderLeft: '4px solid var(--akal-yellow)' }}>
            <div className="text-secondary lh-lg" dangerouslySetInnerHTML={{ __html: overviewHtml }} />
          </div>
        </section>

        {/* Objectives */}
        <section id="aua-objectives" className="mb-5" style={{ scrollMarginTop: '70px' }}>
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <Target size={16} /><span>{labelObjectives}</span>
          </div>
          <div className="row g-4">
            {objectives.map((objective, index) => (
              <div className="col-md-6" key={index}>
                <div className="akal-card h-100">
                  <div className="d-flex gap-3 p-4">
                    <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 fw-bold" style={{ width: '44px', height: '44px', background: 'var(--akal-blue-soft)', color: 'var(--akal-blue)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <p className="mb-0 text-secondary lh-lg small">{objective}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Membership Eligibility */}
        <section id="aua-membership" className="mb-5" style={{ scrollMarginTop: '70px' }}>
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <BadgeCheck size={16} /><span>{labelMembership}</span>
          </div>
          <div className="akal-card p-4 p-md-5">
            <p className="text-secondary mb-4">{membershipIntro}</p>
            <ul className="list-unstyled mb-0">
              {membershipEligibility.map((item, index) => (
                <li className="d-flex align-items-start gap-3 mb-3" key={index}>
                  <span className="mt-1 flex-shrink-0"><CheckCircle2 size={20} className="text-success" /></span>
                  <span className="text-secondary lh-lg small">{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-3 p-3 mt-3" style={{ background: 'var(--akal-yellow-soft)', border: '1px solid #FFE082' }}>
              <span className="small text-dark"><strong>{noteLabel}</strong> {eligibilityNote}</span>
            </div>
            <a href={officialUrl} target="_blank" rel="noreferrer" className="btn btn-akal-primary mt-4">{btnMembership} <ExternalLink size={15} /></a>
          </div>
        </section>

        {/* Membership Categories */}
        <section id="aua-fees" className="mb-5" style={{ scrollMarginTop: '70px' }}>
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <Crown size={16} /><span>{labelCategories}</span>
          </div>
          <div className="row g-3 mb-4">
            {[{ t: cat1, i: Crown }, { t: cat2, i: HeartHandshake }, { t: cat3, i: BadgeCheck }].map((item) => (
              <div className="col-sm-4" key={item.t}>
                <div className="akal-card p-4 text-center h-100" style={{ borderBottom: '3px solid var(--akal-yellow)' }}>
                  <item.i size={22} className="text-primary mb-2" />
                  <h3 className="h6 fw-bold text-dark mb-0">{item.t}</h3>
                </div>
              </div>
            ))}
          </div>
          <h3 className="h5 fw-bold text-dark mb-3">{labelFeeDetails}</h3>
          <div className="row g-4">
            {membershipFees.map((item) => (
              <div className="col-md-6" key={item.title}>
                <div className="akal-card h-100">
                  <div className="p-4">
                    <div className="rounded-pill mb-3" style={{ width: '42px', height: '4px', background: 'var(--akal-yellow)' }} />
                    <h4 className="h5 fw-bold text-dark">{item.title}</h4>
                    <p className="fw-bold fs-5 mb-2 text-primary">{item.fee}</p>
                    <p className="text-secondary mb-0 lh-lg small">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="small text-muted mt-3">{feeNote}</p>
        </section>

        {/* Office Bearers */}
        <section id="aua-bearers" className="mb-5" style={{ scrollMarginTop: '70px' }}>
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <Users size={16} /><span>{labelBearers}</span>
          </div>

          <div className="row g-4">
            {officeBearers.map((person, personIndex) => (
              <div className="col-12" key={person.title}>
                <div className="akal-card">
                  <div className="p-4 p-md-5">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 fw-bold" style={{ width: '44px', height: '44px', background: 'var(--akal-blue-soft)', color: 'var(--akal-blue)' }}>
                        {String(personIndex + 1).padStart(2, '0')}
                      </div>
                      <h3 className="h5 fw-bold text-dark mb-0 mt-2">{person.title}</h3>
                    </div>
                    <ol className="text-secondary mb-0 small">
                      {person.duties.map((duty, index) => (
                        <li className="mb-2 lh-lg" key={index}>{duty}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accounts */}
        <section className="mb-5">
          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase mb-3" style={{ color: 'var(--akal-blue)', letterSpacing: '0.08em' }}>
            <ShieldCheck size={16} /><span>{labelAccounts}</span>
          </div>
          <div className="akal-card p-4 p-md-5">
            <ul className="text-secondary lh-lg mb-0 small">
              {accounts.map((rule, i) => (
                <li className={i < accounts.length - 1 ? 'mb-3' : ''} key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Official Website CTA */}
        <section className="py-4 mt-5 px-4 px-lg-5 rounded-4 text-center text-white position-relative overflow-hidden" style={{ backgroundColor: 'var(--akal-navy)', borderTop: '3px solid var(--akal-yellow)' }}>
          <div className="university-crest mx-auto mb-3" style={{ width: '52px', height: '52px', fontSize: '20px' }}>AU</div>
          <h2 className="h3 fw-bold text-white mb-2">{ctaTitle}</h2>
          <p className="mb-4 mx-auto text-white-50" style={{ maxWidth: '650px' }}>{ctaDesc}</p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/register" className="btn btn-akal-yellow px-4 py-2">{btnJoin} <ArrowRight size={16} /></Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AUAAPage;
