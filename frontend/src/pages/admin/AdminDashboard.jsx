import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminManagement from './AdminManagement';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ABOUT_PAGE_DEFAULTS } from '../public/AboutPage';
import { AUAA_PAGE_DEFAULTS } from '../public/AUAAPage';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Clock,
  Calendar,
  Briefcase,
  Check,
  X,
  Settings,
  Activity,
  PlusCircle,
  Trash2,
  Save,
  Search,
  Sparkles,
  BookOpen,
  Globe,
  Image,
  Bell,
  Edit,
  Eye,
  Sliders,
  Palette,
  Phone,
  Share2,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Mail,
  MapPin,
  Link2,
  Building2,
  Hash,
  CreditCard,
  GraduationCap,
  Landmark,
  Award,
  QrCode
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// ── Plain-text editor helpers for rich-text (HTML) fields ─────────────────
// These fields render as HTML on the site, but admins only see paragraphs —
// <p>/<strong> tags are auto-converted in both directions.
const HTML_TEXT_KEYS = new Set(['about_akal_university', 'auaa_overview_html']);
const htmlToPlain = (html) => String(html || '')
  .replace(/<\s*br\s*\/?>/gi, '\n')
  .replace(/<\/\s*p\s*>/gi, '\n\n')
  .replace(/<\s*p[^>]*>/gi, '')
  .replace(/<\s*strong[^>]*>/gi, '**')
  .replace(/<\/\s*strong\s*>/gi, '**')
  .replace(/<[^>]+>/g, '')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
const plainToHtml = (text) => String(text || '')
  .split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  .map((para) => {
    const withStrong = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    return `<p>${withStrong}</p>`;
  }).join('');

// Complete metadata dictionary for all University System Settings
const DEFAULT_SETTINGS_METADATA = {
  // General Branding & Identity
  site_title: { group: 'general', description: 'Platform display title' },
  university_name: { group: 'general', description: 'Official University Name' },
  tagline: { group: 'general', description: 'Portal Tagline / Subtitle' },
  logo_text: { group: 'general', description: 'Navbar Brand Title' },
  logo_subtext: { group: 'general', description: 'Navbar Brand Subtitle' },
  // About University Content (Navbar "About") — full page customizer
  about_akal_university: { group: 'about', description: 'About Overview Paragraphs (simple text — no tags needed)' },
  about_hero_badge: { group: 'about', description: 'About Hero Pill Badge' },
  about_hero_title: { group: 'about', description: 'About Hero Main Title' },
  about_hero_subtitle: { group: 'about', description: 'About Hero Subtitle Paragraph' },
  about_facts: { group: 'about', description: 'About Quick Facts — 1 per line as: Title | Value | Note' },
  about_values: { group: 'about', description: 'About Value Cards — 1 per line as: Title | Description' },
  about_side_title: { group: 'about', description: 'About Side Panel Heading' },
  about_side_desc: { group: 'about', description: 'About Side Panel Paragraph' },
  about_cta_title: { group: 'about', description: 'About Bottom CTA Heading' },
  about_cta_desc: { group: 'about', description: 'About Bottom CTA Paragraph' },
  about_hero_trust1: { group: 'about', description: 'Hero Trust Marker 1 (e.g. NAAC Grade A)' },
  about_hero_trust2: { group: 'about', description: 'Hero Trust Marker 2 (e.g. Estd. 2015)' },
  about_hero_trust3: { group: 'about', description: 'Hero Trust Marker 3 (e.g. Global Alumni)' },
  about_campus_short: { group: 'about', description: 'Hero Card Campus Line (short)' },
  about_overview_label: { group: 'about', description: 'Overview Section Label' },
  about_side_badge: { group: 'about', description: 'Side Panel Badge Text' },
  about_btn_join: { group: 'about', description: 'Join Network Button Label (hero + bottom CTA)' },
  about_btn_auaa: { group: 'about', description: 'About AUAA Button Label (hero)' },
  about_btn_directory: { group: 'about', description: 'Explore Directory Button Label (side + bottom CTA)' },
  about_btn_stories: { group: 'about', description: 'Success Stories Button Label (side panel)' },
  // AUAA Page Content (Navbar "AUAA") — full page customizer
  auaa_hero_badge: { group: 'auaa', description: 'AUAA Hero Pill Badge' },
  auaa_hero_title: { group: 'auaa', description: 'AUAA Hero Main Title' },
  auaa_hero_subtitle: { group: 'auaa', description: 'AUAA Hero Subtitle Paragraph' },
  auaa_official_url: { group: 'auaa', description: 'AUAA Official University Page URL' },
  auaa_overview_html: { group: 'auaa', description: 'AUAA Overview Paragraphs (simple text — no tags needed)' },
  auaa_objectives: { group: 'auaa', description: 'AUAA Objectives — 1 objective per line' },
  auaa_eligibility: { group: 'auaa', description: 'AUAA Membership Rules — 1 rule per line' },
  auaa_eligibility_note: { group: 'auaa', description: 'AUAA Membership Note Box' },
  auaa_fees: { group: 'auaa', description: 'AUAA Fees — 1 per line as: Title | Fee | Detail' },
  auaa_fee_note: { group: 'auaa', description: 'AUAA Fee Disclaimer Line' },
  auaa_bearers: { group: 'auaa', description: 'AUAA Office Bearers — 1 per line as: Title || Duty || Duty...' },
  auaa_accounts: { group: 'auaa', description: 'AUAA Accounts Rules — 1 rule per line' },
  auaa_cta_title: { group: 'auaa', description: 'AUAA Bottom CTA Heading' },
  auaa_cta_desc: { group: 'auaa', description: 'AUAA Bottom CTA Paragraph' },
  auaa_trust1: { group: 'auaa', description: 'Hero Trust Marker 1 (e.g. Registered Association)' },
  auaa_trust2: { group: 'auaa', description: 'Hero Trust Marker 2 (e.g. 700+ Graduates)' },
  auaa_trust3: { group: 'auaa', description: 'Hero Trust Marker 3 (e.g. Global Network)' },
  auaa_nav_overview: { group: 'auaa', description: 'Quick Nav Pill: Overview' },
  auaa_nav_objectives: { group: 'auaa', description: 'Quick Nav Pill: Objectives' },
  auaa_nav_membership: { group: 'auaa', description: 'Quick Nav Pill: Membership' },
  auaa_nav_fees: { group: 'auaa', description: 'Quick Nav Pill: Fees' },
  auaa_nav_bearers: { group: 'auaa', description: 'Quick Nav Pill: Office Bearers' },
  auaa_label_overview: { group: 'auaa', description: 'Section Label: Overview' },
  auaa_label_objectives: { group: 'auaa', description: 'Section Label: Aims and Objectives' },
  auaa_label_membership: { group: 'auaa', description: 'Section Label: Membership' },
  auaa_label_categories: { group: 'auaa', description: 'Section Label: Categories of Membership' },
  auaa_label_feedetails: { group: 'auaa', description: 'Section Label: Membership Fee Details' },
  auaa_label_bearers: { group: 'auaa', description: 'Section Label: Office Bearers' },
  auaa_label_accounts: { group: 'auaa', description: 'Section Label: Accounts' },
  auaa_membership_intro: { group: 'auaa', description: 'Membership Section Intro Line' },
  auaa_note_label: { group: 'auaa', description: 'Membership Note Box Label (e.g. Note:)' },
  auaa_cat1: { group: 'auaa', description: 'Category Badge 1 (e.g. Patron)' },
  auaa_cat2: { group: 'auaa', description: 'Category Badge 2 (e.g. Donor Members)' },
  auaa_cat3: { group: 'auaa', description: 'Category Badge 3 (e.g. Life Members)' },
  auaa_btn_member: { group: 'auaa', description: 'Become a Member Button Label (hero)' },
  auaa_btn_official: { group: 'auaa', description: 'Official Page Button Label (hero)' },
  auaa_btn_membership: { group: 'auaa', description: 'Official Membership Page Button Label' },
  auaa_btn_visit: { group: 'auaa', description: 'Visit Official Website Button Label (CTA)' },
  auaa_btn_join: { group: 'auaa', description: 'Join Network Button Label (CTA)' },
  primary_color: { group: 'general', description: 'Primary Brand Color (Hex)' },
  accent_color: { group: 'general', description: 'Accent Yellow Color (Hex)' },

  // Top Announcement Bar
  enable_top_banner: { group: 'banner', description: 'Show Top Notification Bar (1 = Enabled, 0 = Disabled)' },
  top_banner_badge: { group: 'banner', description: 'Top Banner Pill Badge' },
  top_banner_text: { group: 'banner', description: 'Top Banner Announcement Text' },

  // Homepage Hero Customizer
  hero_badge_text: { group: 'hero', description: 'Hero Pill Badge Text' },
  hero_headline_line1: { group: 'hero', description: 'Hero Main Title First Line' },
  hero_headline_highlight: { group: 'hero', description: 'Hero Main Title Highlighted Text' },
  hero_description: { group: 'hero', description: 'Hero Descriptive Paragraph' },
  hero_cta_primary_text: { group: 'hero', description: 'Hero Primary Button Label' },
  hero_cta_primary_link: { group: 'hero', description: 'Hero Primary Button Destination' },
  hero_cta_secondary_text: { group: 'hero', description: 'Hero Secondary Button Label' },
  hero_cta_secondary_link: { group: 'hero', description: 'Hero Secondary Button Destination' },

  // Homepage Key Counters & Stats
  stat_alumni_count: { group: 'stats', description: 'Global Alumni Count Stat' },
  stat_alumni_label: { group: 'stats', description: 'Global Alumni Stat Label' },
  stat_chapters_count: { group: 'stats', description: 'Active Regional Chapters Stat' },
  stat_chapters_label: { group: 'stats', description: 'Regional Chapters Stat Label' },
  stat_mentors_count: { group: 'stats', description: 'Verified Mentors Stat' },
  stat_mentors_label: { group: 'stats', description: 'Verified Mentors Stat Label' },
  stat_success_rate: { group: 'stats', description: 'Career Success Rate Stat' },
  stat_success_label: { group: 'stats', description: 'Career Success Stat Label' },
  total_alumni_count: { group: 'stats', description: 'Highlighted Alumni Stat' },
  global_chapters_count: { group: 'stats', description: 'Global Chapters Stat' },
  career_mentors_count: { group: 'stats', description: 'Career Mentors Stat' },

  // Contact & Helpline Details
  contact_email: { group: 'contact', description: 'Official Alumni Office Email' },
  contact_phone: { group: 'contact', description: 'Official Alumni Helpline Phone' },
  contact_phone_alt: { group: 'contact', description: 'Alternate Office Phone' },
  campus_address: { group: 'contact', description: 'Physical Campus Address' },
  office_hours: { group: 'contact', description: 'Alumni Office Working Hours' },

  // Social & External Links
  social_linkedin: { group: 'social', description: 'Official LinkedIn Page URL' },
  social_youtube: { group: 'social', description: 'Official YouTube Channel URL' },
  social_twitter: { group: 'social', description: 'Official Twitter/X Handle URL' },
  social_instagram: { group: 'social', description: 'Official Instagram Handle URL' },
  social_facebook: { group: 'social', description: 'Official Facebook Page URL' },
  university_website: { group: 'social', description: 'Main University Website URL' },

  // Footer & Accreditation Details
  footer_description: { group: 'footer', description: 'Footer Descriptive Text' },
  accreditation_line1: { group: 'footer', description: 'Accreditation Line 1' },
  accreditation_line2: { group: 'footer', description: 'Accreditation Line 2' },
  copyright_text: { group: 'footer', description: 'Footer Copyright Notice' },

  // Feature & Module Access Toggles
  enable_public_directory: { group: 'features', description: 'Allow public visitors to browse alumni directory' },
  enable_public_jobs: { group: 'features', description: 'Allow visitors to view career job board' },
  enable_public_events: { group: 'features', description: 'Allow visitors to view events & reunions' },
  enable_public_stories: { group: 'features', description: 'Allow visitors to read success stories' },
  enable_public_mentorship: { group: 'features', description: 'Enable mentorship hub browsing' },
  enable_public_chapters: { group: 'features', description: 'Enable regional chapters section' },
  enable_public_gallery: { group: 'features', description: 'Enable news & gallery albums section' },
  require_alumni_verification: { group: 'features', description: 'Require administrative verification for new alumni accounts' },
  allow_alumni_job_post: { group: 'features', description: 'Allow verified alumni to post job openings' },
  allow_student_mentorship: { group: 'features', description: 'Allow enrolled students to request 1-on-1 mentorship' },
};

// ── Full Info modal helpers (premium profile view) ─────────────────────────
const akalSectionHead = (Icon, title, count = null) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'var(--grad-primary)', boxShadow: '0 4px 10px rgba(8,123,181,0.3)' }}
    >
      <Icon size={15} className="text-white" />
    </div>
    <h6 className="fw-bold mb-0" style={{ color: 'var(--akal-navy)', fontSize: '0.92rem', fontFamily: 'var(--font-heading)' }}>{title}</h6>
    {count !== null && (
      <span className="badge rounded-pill px-2" style={{ background: 'var(--akal-blue-soft)', color: 'var(--akal-blue-deep)', fontSize: '0.68rem' }}>{count}</span>
    )}
    <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(90deg, var(--akal-gray-200), transparent)' }}></div>
  </div>
);

const statusRingColor = (status) => (
  status === 'active' ? '#22C55E' : (status === 'pending' ? '#F59E0B' : (status === 'rejected' ? '#EF4444' : '#94A3B8'))
);

const InfoTile = ({ icon: Icon, label, value, full = false, tone = 'default', link = false }) => {
  const isDanger = tone === 'danger';
  const display = value || '—';
  const isUrl = link && value && /^https?:\/\//i.test(String(value));
  return (
    <div className={`${full ? 'col-12' : 'col-md-6'} col-12`}>
      <div
        className="d-flex align-items-center gap-2 p-2 rounded-3 h-100"
        style={{
          background: isDanger ? 'linear-gradient(135deg,#FEF2F2,#FFF7F7)' : 'var(--akal-bg-light)',
          border: `1px solid ${isDanger ? '#FECACA' : 'var(--akal-gray-200)'}`,
          transition: 'var(--transition-normal)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '34px', height: '34px', borderRadius: '11px',
            background: isDanger ? '#fff' : 'var(--akal-white)',
            border: `1px solid ${isDanger ? '#FECACA' : 'var(--akal-gray-200)'}`,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon size={15} style={{ color: isDanger ? '#DC2626' : 'var(--akal-blue)' }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="text-uppercase fw-bold" style={{ fontSize: '0.6rem', color: 'var(--akal-gray-400)', letterSpacing: '0.06em' }}>{label}</div>
          <div className="fw-semibold text-break" style={{ fontSize: '0.84rem', color: isDanger ? '#B91C1C' : 'var(--akal-gray-800)', lineHeight: 1.35 }}>
            {isUrl ? (
              <a href={String(value)} target="_blank" rel="noreferrer" style={{ color: 'var(--akal-blue-deep)', textDecoration: 'none', borderBottom: '1px dotted var(--akal-blue)' }}>
                {String(value).replace(/^https?:\/\/(www\.)?/, '').slice(0, 42)}
              </a>
            ) : display}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isSuperAdmin, isAdmin, isAuthenticated, quickDemoLogin, token, loading: authLoading, permissions, hasPermission } = useAuth();
  const { refreshSettings } = useSettings();

  const [dashboardData, setDashboardData] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [settings, setSettings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [navbarHeight, setNavbarHeight] = useState(100);
  const [footerHeight, setFooterHeight] = useState(80);

  // Sub-tab inside System Settings for granular control
  const [settingsGroupTab, setSettingsGroupTab] = useState('general');
  const [toastMessage, setToastMessage] = useState(null);

  // Last published snapshot of settings -> used to detect unsaved (not live) edits
  const [savedSettings, setSavedSettings] = useState({});

  // Custom setting state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newGroup, setNewGroup] = useState('general');
  const [newDesc, setNewDesc] = useState('');

  // CMS States: Stories, News, Chapters, Jobs, Events, Gallery
  const [stories, setStories] = useState([]);
  const [news, setNews] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);

  // CMS Modal / Form states
  const [editingStory, setEditingStory] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);

  // Search in users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Manage Alumni / Manage Students tabs
  const [manageSearch, setManageSearch] = useState('');
  const [manageStatusFilter, setManageStatusFilter] = useState('');
  const [detailUserId, setDetailUserId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Merge DB settings with page defaults so keys (e.g. about_*/auaa_*)
  // always appear in Site Customizer pre-filled with live site content —
  // admins can edit directly, no empty boxes.
  const PAGE_DEFAULTS = { ...ABOUT_PAGE_DEFAULTS, ...AUAA_PAGE_DEFAULTS };
  const mergeWithMetadataDefaults = (dbList) => {
    const seen = new Set((dbList || []).map((s) => s.setting_key));
    // A key exists in DB but its value is empty → fill with site default content
    const filled = (dbList || []).map((s) => (
      (s.setting_value === '' || s.setting_value === null || s.setting_value === undefined) && PAGE_DEFAULTS[s.setting_key] !== undefined
        ? { ...s, setting_value: PAGE_DEFAULTS[s.setting_key] }
        : s
    ));
    const missing = Object.entries(DEFAULT_SETTINGS_METADATA)
      .filter(([key]) => !seen.has(key))
      .map(([key, meta]) => ({
        setting_key: key,
        setting_value: PAGE_DEFAULTS[key] ?? '',
        setting_group: meta.group,
        description: meta.description,
      }));
    return [...filled, ...missing];
  };

  // Gracefully load public settings as fallback so edit fields are never empty
  const loadFallbackSettings = async () => {
    try {
      const pubRes = await api.get('/public/settings');
      if (pubRes.status && pubRes.data) {
        const fallbackList = Object.entries(pubRes.data).map(([key, val]) => {
          const meta = DEFAULT_SETTINGS_METADATA[key] || { group: 'general', description: key.replace(/_/g, ' ') };
          return {
            setting_key: key,
            setting_value: val,
            setting_group: meta.group,
            description: meta.description
          };
        });
        const merged = mergeWithMetadataDefaults(fallbackList);
        setSettings(merged);
        const snapshot = {};
        merged.forEach(s => { snapshot[s.setting_key] = s.setting_value; });
        setSavedSettings(snapshot);
      }
    } catch (pubErr) {
      console.error('Fallback settings error:', pubErr);
    }
  };

  const fetchDashboard = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/verifications'),
        api.get('/admin/users'),
        api.get('/admin/settings'),
        api.get('/admin/audit-logs')
      ]);

      const [dashRes, verifRes, usersRes, settRes, logsRes] = results;

      if (dashRes.status === 'fulfilled' && dashRes.value?.status) {
        setDashboardData(dashRes.value.data);
      }
      if (verifRes.status === 'fulfilled' && verifRes.value?.status) {
        setVerifications(verifRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.status) {
        setUsersList(usersRes.value.data);
      }
      if (settRes.status === 'fulfilled' && settRes.value?.status && Array.isArray(settRes.value.data) && settRes.value.data.length > 0) {
        const merged = mergeWithMetadataDefaults(settRes.value.data);
        setSettings(merged);
        const snapshot = {};
        merged.forEach(s => { snapshot[s.setting_key] = s.setting_value; });
        setSavedSettings(snapshot);
      } else {
        // Fallback: If not logged in as admin yet, load public settings with metadata so edit options are visible!
        await loadFallbackSettings();
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.status) {
        setAuditLogs(logsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      await loadFallbackSettings();
    } finally {
      setLoading(false);
    }
  };

  const fetchCMSContent = async () => {
    try {
      const [storiesRes, newsRes, chaptersRes, jobsRes, eventsRes, galleryRes] = await Promise.all([
        api.get('/public/stories'),
        api.get('/public/news'),
        api.get('/public/chapters'),
        api.get('/public/jobs'),
        api.get('/public/events'),
        api.get('/public/gallery')
      ]);

      if (storiesRes.status) setStories(storiesRes.data);
      if (newsRes.status) setNews(newsRes.data);
      if (chaptersRes.status) setChapters(chaptersRes.data);
      if (jobsRes.status) setJobs(jobsRes.data);
      if (eventsRes.status) setEvents(eventsRes.data);
      if (galleryRes.status) setGallery(galleryRes.data);
    } catch (err) {
      console.error('Error fetching CMS content:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCMSContent();
  }, [token, user?.id, user?.role]);

  // Measure navbar and footer height so the Site Customizer sidebar stays within viewport bounds
  useEffect(() => {
    const measureLayout = () => {
      const navbar = document.getElementById('akal-main-navbar');
      const footer = document.getElementById('akal-main-footer');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
      if (footer) {
        setFooterHeight(footer.offsetHeight);
      }
    };
    measureLayout();
    window.addEventListener('resize', measureLayout);
    return () => window.removeEventListener('resize', measureLayout);
  }, []);

  // Verification approvals
  const handleApprove = async (userId) => {
    if (!hasPermission('verify_alumni') && !hasPermission('manage_alumni') && !hasPermission('manage_users')) {
      alert('You do not have verification permission');
      return;
    }
    try {
      const res = await api.post(`/admin/verifications/${userId}/approve`);
      if (res.status) {
        setVerifications(verifications.filter(v => v.id !== userId));
        showToast('Alumni profile verified and digital ID card generated!');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (userId) => {
    if (!hasPermission('verify_alumni') && !hasPermission('manage_alumni') && !hasPermission('manage_users')) {
      alert('You do not have verification permission');
      return;
    }
    const reason = prompt('Please provide reason for verification rejection:');
    if (!reason) return;

    try {
      const res = await api.post(`/admin/verifications/${userId}/reject`, { reason });
      if (res.status) {
        setVerifications(verifications.filter(v => v.id !== userId));
        showToast('Alumni verification rejected.');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  // User Management: Role & Status (superadmin only)
  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) { alert('Only Super Admin can change roles'); return; }
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.status) {
        showToast(`User role updated to ${newRole.toUpperCase()}!`);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const canManageTargetUser = (targetRole) => {
    if (isSuperAdmin) return true;
    if (targetRole === 'alumni') {
      return hasPermission('manage_alumni') || hasPermission('manage_users') || hasPermission('verify_alumni');
    }
    if (targetRole === 'student') {
      return hasPermission('manage_students') || hasPermission('manage_users');
    }
    return hasPermission('manage_users');
  };

  const handleStatusChange = async (userId, newStatus) => {
    const target = usersList.find(u => u.id === userId) || (detailData?.user?.id === userId ? detailData.user : null);
    const targetRole = target?.role || '';
    if (!canManageTargetUser(targetRole)) {
      alert(`You do not have permission to manage ${targetRole || 'user'} accounts`);
      return;
    }
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.status) {
        showToast(`User account set to ${newStatus.toUpperCase()}!`);
        if (detailUserId === userId) openUserDetail(userId);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  // Manage Alumni / Manage Students — reject users to accept later
  const handleAcceptUser = async (u) => {
    if (!canManageTargetUser(u.role)) {
      alert(`You do not have permission to manage ${u.role} accounts`);
      return;
    }
    const name = u.a_fname ? `${u.a_fname} ${u.a_lname || ''}` : (u.s_fname ? `${u.s_fname} ${u.s_lname || ''}` : u.email);
    if (!window.confirm(`Accept & activate the account of ${name}?`)) return;
    try {
      let res;
      if (u.role === 'alumni') {
        // Alumni: verification approve → account active + digital ID card issued
        res = await api.post(`/admin/verifications/${u.id}/approve`);
      } else {
        // Non-alumni (e.g. rejected student): sirf account activate
        res = await api.put(`/admin/users/${u.id}/status`, { status: 'active' });
      }
      if (res.status) {
        showToast(`${name} accepted & activated successfully!`);
        if (detailUserId === u.id) openUserDetail(u.id);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Accept failed');
    }
  };

  // Full Info modal — poori profile (profile + education + ID card + recent activity)
  const openUserDetail = async (userId) => {
    setDetailUserId(userId);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/detail`);
      if (res.status) setDetailData(res.data);
    } catch (err) {
      alert(err.message || 'Failed to load user detail');
      setDetailUserId(null);
    }
    setDetailLoading(false);
  };

  const closeUserDetail = () => {
    setDetailUserId(null);
    setDetailData(null);
  };

  // Shared badges + Manage tab table (alumni & students dono ke liye)
  const statusBadge = (status) => {
    const map = { active: 'bg-success', pending: 'bg-warning text-dark', rejected: 'bg-danger', suspended: 'bg-secondary' };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const verifBadge = (vs) => {
    if (!vs) return null;
    const map = { verified: 'bg-success', pending: 'bg-warning text-dark', rejected: 'bg-danger', unverified: 'bg-secondary' };
    return <span className={`badge ${map[vs] || 'bg-secondary'}`}>ID: {vs}</span>;
  };

  const renderManageTab = (roleKey, list) => (
    <div className="akal-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold text-dark mb-0">
          {roleKey === 'alumni' ? '🎓 Manage Alumni Accounts' : '🎒 Manage Student Accounts'}
        </h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group input-group-sm" style={{ width: '230px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder={roleKey === 'alumni' ? 'Name / email / AUID...' : 'Name / email / enrollment no...'}
              value={manageSearch}
              onChange={(e) => setManageSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={manageStatusFilter}
            onChange={(e) => setManageStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Users size={44} className="mb-2 opacity-50" />
          <p className="mb-0 fw-semibold">No {roleKey} accounts found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle small">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>{roleKey === 'alumni' ? 'AUID' : 'Enrollment No'}</th>
                <th>{roleKey === 'alumni' ? 'Degree & Batch' : 'Programme'}</th>
                <th>Status</th>
                <th>Registered On</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => {
                const flagged = needsAction(u);
                return (
                  <tr key={u.id} className={u.status === 'rejected' ? 'table-danger' : (flagged ? 'table-warning' : '')}>
                    <td>
                      <div className="fw-bold text-dark">{userDisplayName(u)}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                      {(u.a_phone || u.s_phone) && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.a_phone || u.s_phone}</div>}
                    </td>
                    <td className="font-monospace">{roleKey === 'alumni' ? (u.a_auid || '—') : (u.s_enrollment || '—')}</td>
                    <td>
                      {roleKey === 'alumni' ? (
                        <>
                          <div className="fw-semibold">{u.a_degree || '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.a_department}{u.a_batch ? ` • ${u.a_batch}` : ''}</div>
                          {u.a_designation && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.a_designation}{u.a_company ? ` @ ${u.a_company}` : ''}</div>}
                        </>
                      ) : (
                        <>
                          <div className="fw-semibold">{u.s_degree || '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.s_department}</div>
                        </>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {statusBadge(u.status)}
                        {verifBadge(u.verification_status)}
                      </div>
                      {u.status === 'rejected' && u.a_admin_notes && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.72rem' }}>Reason: {u.a_admin_notes}</div>
                      )}
                    </td>
                    <td className="text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => openUserDetail(u.id)}
                          title="Full profile dekhein"
                        >
                          <Eye size={13} /> Full Info
                        </button>
                        {flagged && (
                          <button
                            className="btn btn-sm btn-success d-flex align-items-center gap-1"
                            onClick={() => handleAcceptUser(u)}
                            title={u.role === 'alumni' ? 'Approve & activate alumni account + ID card' : 'Activate account'}
                          >
                            <UserCheck size={13} /> Accept
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleStatusChange(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // System Settings Management
  const handleSettingChange = (key, value) => {
    setSettings(settings.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const handleSaveSettings = async () => {
    if (!hasPermission('manage_settings')) {
      alert('You do not have settings permission. Contact Super Admin.');
      return;
    }

    try {
      const payload = {};
      settings.forEach(s => { payload[s.setting_key] = s.setting_value; });
      const res = await api.post('/admin/settings', payload);
      if (res.status) {
        setSavedSettings({ ...payload });
        // Published -> any preview draft is now the live site, drop it
        try { localStorage.removeItem('akal_settings_draft'); } catch { /* ignore */ }
        showToast('All site details saved — now LIVE on the website!');
        refreshSettings();
      }
    } catch (err) {
      alert('Failed to save settings: ' + (err.message || 'Error occurred'));
    }
  };

  // Open the public site in a new tab with the unsaved edits applied (nothing is published)
  const handlePreviewSite = () => {
    const payload = {};
    settings.forEach(s => { payload[s.setting_key] = s.setting_value; });
    try {
      localStorage.setItem('akal_settings_draft', JSON.stringify({ savedAt: Date.now(), settings: payload }));
      window.open('/?preview=1', '_blank');
      showToast('Preview opened in a new tab — changes are not published yet.');
    } catch (err) {
      alert('Could not open preview: ' + err.message);
    }
  };

  // Revert unsaved edits back to the last published values
  const handleDiscardSettings = () => {
    if (!window.confirm('Discard all unsaved changes and reload the last published settings?')) return;
    try { localStorage.removeItem('akal_settings_draft'); } catch { /* ignore */ }
    setSettings(settings.map(s => ({ ...s, setting_value: savedSettings[s.setting_key] ?? s.setting_value })));
    showToast('Unsaved changes discarded.');
  };

  const handleAddCustomSetting = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_settings')) { alert('You do not have settings permission'); return; }
    if (!newKey.trim()) return;

    try {
      const res = await api.post('/admin/settings/custom', {
        setting_key: newKey.trim(),
        setting_value: newValue,
        setting_group: newGroup,
        description: newDesc || 'Custom site parameter'
      });

      if (res.status) {
        showToast(`Custom detail "${newKey}" created successfully!`);
        setNewKey('');
        setNewValue('');
        setNewDesc('');
        const settRes = await api.get('/admin/settings');
        if (settRes.status) {
          setSettings(settRes.data);
          const snapshot = {};
          settRes.data.forEach(s => { snapshot[s.setting_key] = s.setting_value; });
          setSavedSettings(snapshot);
        }
        refreshSettings();
      }
    } catch (err) {
      alert(err.message || 'Failed to add custom detail');
    }
  };

  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`Are you sure you want to delete setting: "${key}"?`)) return;
    try {
      const res = await api.delete(`/admin/settings/${key}`);
      if (res.status) {
        showToast(`Setting "${key}" removed.`);
        setSettings(settings.filter(s => s.setting_key !== key));
        const nextSnapshot = { ...savedSettings };
        delete nextSnapshot[key];
        setSavedSettings(nextSnapshot);
        refreshSettings();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete setting');
    }
  };

  // CMS Story Handlers
  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_stories')) { alert('No story permission'); return; }
    try {
      const res = await api.post('/admin/stories', editingStory);
      if (res.status) {
        showToast('Success story saved successfully!');
        setEditingStory(null);
        fetchCMSContent();
      }
    } catch (err) {
      alert(err.message || 'Failed to save story');
    }
  };

  const handleDeleteStory = async (id) => {
    if (!hasPermission('manage_stories')) { alert('No story permission'); return; }
    if (!window.confirm('Delete this success story?')) return;
    try {
      const res = await api.delete(`/admin/stories/${id}`);
      if (res.status) {
        showToast('Story removed.');
        setStories(stories.filter(s => s.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete story');
    }
  };

  // CMS News Handlers
  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_news')) { alert('No news permission'); return; }
    try {
      const res = await api.post('/admin/news', editingNews);
      if (res.status) {
        showToast('News announcement saved successfully!');
        setEditingNews(null);
        fetchCMSContent();
      }
    } catch (err) {
      alert(err.message || 'Failed to save news');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!hasPermission('manage_news')) { alert('No news permission'); return; }
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/admin/news/${id}`);
      if (res.status) {
        showToast('Announcement removed.');
        setNews(news.filter(n => n.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  // CMS Chapter Handlers
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_chapters')) { alert('No chapter permission'); return; }
    try {
      const res = await api.post('/admin/chapters', editingChapter);
      if (res.status) {
        showToast('Chapter details saved successfully!');
        setEditingChapter(null);
        fetchCMSContent();
      }
    } catch (err) {
      alert(err.message || 'Failed to save chapter');
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!hasPermission('manage_chapters')) { alert('No chapter permission'); return; }
    if (!window.confirm('Delete this chapter?')) return;
    try {
      const res = await api.delete(`/admin/chapters/${id}`);
      if (res.status) {
        showToast('Chapter removed.');
        setChapters(chapters.filter(c => c.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete chapter');
    }
  };

  // CMS Job Handlers
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_jobs')) { alert('No jobs permission'); return; }
    try {
      const res = await api.post('/admin/jobs', editingJob);
      if (res.status) {
        showToast('Career opportunity saved successfully!');
        setEditingJob(null);
        fetchCMSContent();
      }
    } catch (err) {
      alert(err.message || 'Failed to save job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!hasPermission('manage_jobs')) { alert('No jobs permission'); return; }
    if (!window.confirm('Delete this job posting?')) return;
    try {
      const res = await api.delete(`/admin/jobs/${id}`);
      if (res.status) {
        showToast('Job posting removed.');
        setJobs(jobs.filter(j => j.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  // CMS Event Handlers
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_events')) { alert('No events permission'); return; }
    try {
      const res = await api.post('/admin/events', editingEvent);
      if (res.status) {
        showToast('Event published/saved successfully!');
        setEditingEvent(null);
        fetchCMSContent();
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await api.delete(`/admin/events/${id}`);
      if (res.status) {
        showToast('Event removed.');
        setEvents(events.filter(e => e.id !== id));
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  // CMS Gallery Handlers
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/gallery', editingGallery);
      if (res.status) {
        showToast('Gallery album saved successfully!');
        setEditingGallery(null);
        fetchCMSContent();
      }
    } catch (err) {
      alert(err.message || 'Failed to save gallery album');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery album?')) return;
    try {
      const res = await api.delete(`/admin/gallery/${id}`);
      if (res.status) {
        showToast('Gallery album removed.');
        setGallery(gallery.filter(g => g.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete album');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading Administrative Control Hub...</p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = usersList.filter(u => {
    const matchSearch = !userSearch ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.a_fname && u.a_fname.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.a_lname && u.a_lname.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.adm_name && u.adm_name.toLowerCase().includes(userSearch.toLowerCase()));
    const matchRole = !userRoleFilter || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Manage Alumni / Manage Students — search + status filter (pending / rejected also shown)
  const userDisplayName = (u) =>
    u.a_fname ? `${u.a_fname} ${u.a_lname || ''}`
      : (u.s_fname ? `${u.s_fname} ${u.s_lname || ''}`
        : (u.adm_name || u.email));

  const filteredManageUsers = (roleKey) => usersList.filter(u => {
    if (u.role !== roleKey) return false;
    const q = manageSearch.trim().toLowerCase();
    const matchSearch = !q ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.a_fname && `${u.a_fname} ${u.a_lname || ''}`.toLowerCase().includes(q)) ||
      (u.s_fname && `${u.s_fname} ${u.s_lname || ''}`.toLowerCase().includes(q)) ||
      (u.a_auid && u.a_auid.includes(manageSearch.trim())) ||
      (u.a_alumni_id && u.a_alumni_id.toLowerCase().includes(q)) ||
      (u.s_enrollment && u.s_enrollment.toLowerCase().includes(q));
    const matchStatus = !manageStatusFilter || u.status === manageStatusFilter;
    return matchSearch && matchStatus;
  });

  const manageAlumniList = filteredManageUsers('alumni');
  const manageStudentsList = filteredManageUsers('student');

  // Rejected/pending accounts that admin can accept later
  const needsAction = (u) =>
    u.status === 'rejected' || u.verification_status === 'rejected' ||
    u.status === 'pending' || u.verification_status === 'pending';

  const alumniNeedsAction = usersList.filter(u => u.role === 'alumni' && needsAction(u)).length;
  const studentsNeedsAction = usersList.filter(u => u.role === 'student' && needsAction(u)).length;

  // Settings group categories with sections for visual grouping
  const settingsCategories = [
    { key: 'general', label: 'Branding & Identity', icon: Palette, section: 'appearance' },
    { key: 'banner', label: 'Announcement Banner', icon: Bell, section: 'appearance' },
    { key: 'hero', label: 'Homepage Hero', icon: Sparkles, section: 'appearance' },
    { key: 'stats', label: 'Stats & Counters', icon: Activity, section: 'content' },
    { key: 'contact', label: 'Contact & Campus', icon: Phone, section: 'content' },
    { key: 'social', label: 'Social Links', icon: Share2, section: 'content' },
    { key: 'footer', label: 'Footer & Credits', icon: ShieldCheck, section: 'content' },
    { key: 'about', label: 'About University', icon: BookOpen, section: 'content' },
    { key: 'auaa', label: 'AUAA (Association)', icon: Landmark, section: 'content' },
    { key: 'features', label: 'Module Toggles', icon: Sliders, section: 'advanced' },
    { key: 'custom', label: 'Custom Parameters', icon: PlusCircle, section: 'advanced' },
  ];

  // Count of settings per group for sidebar badges
  const settingsCountByGroup = {};
  settings.forEach(s => {
    const grp = s.setting_group || 'general';
    settingsCountByGroup[grp] = (settingsCountByGroup[grp] || 0) + 1;
  });

  // Section labels for sidebar grouping
  const sectionLabels = {
    appearance: 'Appearance',
    content: 'Content & Info',
    advanced: 'Advanced',
  };

  const filteredSettings = settings.filter(s => {
    if (settingsGroupTab === 'all') return true;
    return s.setting_group === settingsGroupTab;
  });

  // Edited but not yet saved/published (live site unchanged)
  const unsavedCount = settings.filter(
    s => String(s.setting_value ?? '') !== String(savedSettings[s.setting_key] ?? '')
  ).length;

  // Chart data
  const deptLabels = dashboardData?.dept_distribution?.map(d => d.department || 'General') || [];
  const deptCounts = dashboardData?.dept_distribution?.map(d => parseInt(d.count)) || [];

  const deptChartData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Alumni by Department',
        data: deptCounts,
        backgroundColor: ['#087BB5', '#F9B900', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'],
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="admin-dashboard py-4" style={{ backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
      <div className="container-fluid px-lg-4">

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
            <div className="alert alert-success shadow-lg border-0 d-flex align-items-center gap-2 py-2 px-4 rounded-pill">
              <CheckCircle2 size={18} />
              <span className="fw-bold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2">
              {authLoading ? null : isAdmin ? (
                <span className="badge bg-danger rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                  {isSuperAdmin ? '⚡ SUPER ADMINISTRATOR' : 'ADMINISTRATOR'}
                </span>
              ) : (
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                  ⚠️ GUEST / LOGIN REQUIRED
                </span>
              )}
              <span className="text-muted small">Central Operations & Site Customizer</span>
            </div>
            <h3 className="fw-extrabold text-dark mb-0 mt-1">Akal University Command Center</h3>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {!authLoading && !isAdmin && (
              <button
                onClick={async () => {
                  await quickDemoLogin('superadmin@akaluniversity.ac.in', 'Admin@12345');
                  showToast('⚡ Logged in as Super Admin! All edit options unlocked.');
                }}
                className="btn btn-sm btn-danger fw-bold d-flex align-items-center gap-1 shadow-sm"
              >
                <Sparkles size={14} /> ⚡ 1-Click Super Admin Login
              </button>
            )}
            <button
              onClick={() => { fetchDashboard(); fetchCMSContent(); refreshSettings(); showToast('Data synchronized with database!'); }}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            >
              <Activity size={14} /> Refresh Live Data
            </button>
            <button
              onClick={() => { setActiveTab('settings'); }}
              className="btn btn-sm btn-akal-yellow d-flex align-items-center gap-1 fw-bold"
            >
              <Settings size={14} /> Customize Entire Site
            </button>
          </div>
        </div>

        {/* Prominent Banner if user is NOT logged in as Admin */}
        {!authLoading && !isAdmin && (
          <div className="alert alert-warning border-2 border-warning shadow-sm rounded-4 p-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper stat-icon-yellow flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                <Lock size={22} className="text-warning" />
              </div>
              <div>
                <h6 className="alert-heading fw-bold mb-1 text-dark">
                  🔐 Administrator Authentication Required — edit options locked
                </h6>
                <p className="mb-0 text-muted small">
                  You are not logged in as a Super Admin account. To edit database settings, verification queue and user permissions and save live, please <strong>1-Click Super Admin Login</strong>:
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap flex-shrink-0">
              <button
                onClick={async () => {
                  await quickDemoLogin('superadmin@akaluniversity.ac.in', 'Admin@12345');
                  showToast('⚡ Logged in as Super Admin! All edit options unlocked.');
                }}
                className="btn btn-primary fw-bold d-flex align-items-center gap-2 shadow-sm"
              >
                <Sparkles size={16} /> ⚡ 1-Click Super Admin Login
              </button>
              <button
                onClick={async () => {
                  await quickDemoLogin('admin@akaluniversity.ac.in', 'Admin@12345');
                  showToast('⚡ Logged in as Alumni Admin!');
                }}
                className="btn btn-outline-dark fw-semibold btn-sm"
              >
                Alumni Admin Login
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs — permission-aware (superadmin sees all) */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'analytics' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics & Reports
          </button>

          {(hasPermission('verify_alumni') || hasPermission('manage_alumni') || hasPermission('manage_users')) && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'verifications' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('verifications')}
            >
              Verification Queue ({verifications.length})
            </button>
          )}

          {hasPermission('manage_users') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'users' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('users')}
            >
              User Management ({usersList.length})
            </button>
          )}

          {(hasPermission('manage_users') || hasPermission('manage_alumni')) && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'manage-alumni' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('manage-alumni')}
            >
              🎓 Manage Alumni ({usersList.filter(u => u.role === 'alumni').length})
              {alumniNeedsAction > 0 && <span className="badge bg-warning text-dark ms-1">{alumniNeedsAction}</span>}
            </button>
          )}

          {(hasPermission('manage_users') || hasPermission('manage_students')) && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'manage-students' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('manage-students')}
            >
              🎒 Manage Students ({usersList.filter(u => u.role === 'student').length})
              {studentsNeedsAction > 0 && <span className="badge bg-warning text-dark ms-1">{studentsNeedsAction}</span>}
            </button>
          )}

          {isSuperAdmin && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-bold ${activeTab === 'admins' ? 'btn-danger' : 'btn-light border text-danger'}`}
              onClick={() => setActiveTab('admins')}
            >
              🛡️ Admins & Permissions
            </button>
          )}

          {hasPermission('manage_settings') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'settings' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('settings')}
            >
              🎨 Site Customizer & Settings
            </button>
          )}

          {/* CMS Module Tabs */}
          {hasPermission('manage_stories') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-stories' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-stories')}
            >
              📖 Stories ({stories.length})
            </button>
          )}

          {hasPermission('manage_news') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-news' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-news')}
            >
              📢 News & Notices ({news.length})
            </button>
          )}

          {hasPermission('manage_events') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-events' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-events')}
            >
              📅 Events ({events.length})
            </button>
          )}

          {hasPermission('manage_jobs') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-jobs' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-jobs')}
            >
              💼 Jobs ({jobs.length})
            </button>
          )}

          {hasPermission('manage_chapters') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-chapters' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-chapters')}
            >
              🌍 Chapters ({chapters.length})
            </button>
          )}

          {hasPermission('manage_gallery') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'cms-gallery' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('cms-gallery')}
            >
              🖼️ Gallery ({gallery.length})
            </button>
          )}

          {hasPermission('view_audit_logs') && (
            <button
              className={`btn btn-sm px-3 rounded-pill fw-semibold ${activeTab === 'logs' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setActiveTab('logs')}
            >
              🛡️ Audit Logs ({auditLogs.length})
            </button>
          )}
        </div>

        {/* Limited-permission notice for admins */}
        {isAdmin && !isSuperAdmin && (
          <div className="alert alert-info small rounded-3 mb-4">
            🔑 You are logged in as <strong>Admin</strong> with limited permissions ({Object.keys(permissions || {}).length} granted). Tabs you cannot access are hidden — contact Super Admin to grant more access.
          </div>
        )}

        {/* TAB 1: Analytics & Reports */}
        {activeTab === 'analytics' && (
          <div>
            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-lg-3 col-sm-6">
                <div className="akal-card p-3 d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <Users />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">{dashboardData?.metrics?.total_alumni || 0}</h4>
                    <span className="text-muted small">Total Alumni Registered</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className="akal-card p-3 d-flex align-items-center gap-3 border-warning">
                  <div className="stat-icon-wrapper stat-icon-yellow">
                    <Clock />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold text-warning">{dashboardData?.metrics?.pending_verifications || 0}</h4>
                    <span className="text-muted small">Pending Verifications</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className="akal-card p-3 d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper stat-icon-green">
                    <UserCheck />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">{dashboardData?.metrics?.verified_alumni || 0}</h4>
                    <span className="text-muted small">Verified Active Members</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className="akal-card p-3 d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper stat-icon-purple">
                    <Calendar />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">{dashboardData?.metrics?.total_events || 0}</h4>
                    <span className="text-muted small">Published Events</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts & Graphs */}
            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className="akal-card p-4 h-100">
                  <h6 className="fw-bold text-dark mb-3">Alumni Distribution Across Departments</h6>
                  <div style={{ height: '280px' }}>
                    <Bar
                      data={deptChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="akal-card p-4 h-100">
                  <h6 className="fw-bold text-dark mb-3">Community Composition</h6>
                  <div style={{ height: '220px' }}>
                    <Doughnut
                      data={{
                        labels: ['Verified Alumni', 'Enrolled Students', 'Career Mentors'],
                        datasets: [{
                          data: [
                            dashboardData?.metrics?.verified_alumni || 5,
                            dashboardData?.metrics?.total_students || 10,
                            dashboardData?.metrics?.total_mentors || 3
                          ],
                          backgroundColor: ['#087BB5', '#F9B900', '#10B981']
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                  <div className="mt-3 text-center small text-muted">
                    Total Ecosystem Network: <strong>{dashboardData?.metrics?.total_alumni + dashboardData?.metrics?.total_students} accounts</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="akal-card p-4">
              <h6 className="fw-bold text-dark mb-3">Recent User Registrations & Onboarding</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle small">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department & Details</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recent_users?.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="fw-bold">{u.a_fname ? `${u.a_fname} ${u.a_lname || ''}` : (u.s_fname ? `${u.s_fname} ${u.s_lname || ''}` : u.email)}</div>
                          <div className="text-muted small font-monospace">{u.email}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'alumni' ? 'bg-primary' : (u.role === 'student' ? 'bg-warning text-dark' : 'bg-danger')}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{u.a_degree || 'Academic Student'} ({u.a_batch || '2026'})</td>
                        <td>
                          <span className={`badge ${u.verification_status === 'verified' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {u.verification_status}
                          </span>
                        </td>
                        <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Verification Queue */}
        {activeTab === 'verifications' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Pending Alumni Verifications</h5>
              <span className="badge bg-warning text-dark px-3 py-1">{verifications.length} Pending Review</span>
            </div>

            {verifications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <ShieldCheck size={48} className="text-success mb-2 opacity-50" />
                <p className="mb-0 fw-semibold">All alumni accounts are verified! No pending requests.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Candidate</th>
                      <th>Degree & Batch</th>
                      <th>Current Designation</th>
                      <th>Submitted On</th>
                      <th className="text-end">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div className="fw-bold text-dark">{v.first_name} {v.last_name}</div>
                          <div className="text-muted small font-monospace">{v.email}</div>
                          {v.phone && <div className="text-muted small">{v.phone}</div>}
                        </td>
                        <td>
                          <div className="fw-semibold">{v.degree}</div>
                          <div className="text-muted small">{v.department} • Batch of {v.batch_year}</div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">{v.current_designation || 'Not specified'}</div>
                          <div className="text-muted small">{v.current_company || 'Independent'}</div>
                        </td>
                        <td className="text-muted small">{new Date(v.created_at).toLocaleString()}</td>
                        <td className="text-end">
                          <div className="btn-group">
                            <button onClick={() => handleApprove(v.id)} className="btn btn-sm btn-success d-flex align-items-center gap-1">
                              <Check size={14} /> Approve & Issue ID
                            </button>
                            <button onClick={() => handleReject(v.id)} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: User Management (Role changes & account activation) */}
        {activeTab === 'users' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold text-dark mb-0">System User Accounts Directory & Permissions</h5>

              <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm" style={{ width: '220px' }}>
                  <span className="input-group-text bg-white"><Search size={14} /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-select form-select-sm"
                  style={{ width: '140px' }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="alumni">Alumni</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>User ID</th>
                    <th>Name & Email</th>
                    <th>Current Role</th>
                    <th>Status</th>
                    <th>Change Role</th>
                    <th>Account Status</th>
                    <th className="text-end">Full Info</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-monospace text-muted">#{u.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{u.a_fname ? `${u.a_fname} ${u.a_lname || ''}` : (u.adm_name ? u.adm_name : (u.s_fname ? `${u.s_fname} ${u.s_lname || ''}` : u.email))}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'superadmin' ? 'bg-danger' : (u.role === 'admin' ? 'bg-purple' : (u.role === 'alumni' ? 'bg-primary' : 'bg-warning text-dark'))}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ width: '130px' }}
                        >
                          <option value="superadmin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="alumni">Alumni</option>
                          <option value="student">Student</option>
                          <option value="public_visitor">Visitor</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleStatusChange(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => openUserDetail(u.id)}
                          title="View full profile"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No users found. {!isAdmin && '(Admin login required to view all user accounts)'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Manage Alumni — full info, activate/deactivate, rejected ko accept */}
        {activeTab === 'manage-alumni' && (hasPermission('manage_users') || hasPermission('manage_alumni')) && renderManageTab('alumni', manageAlumniList)}

        {/* TAB: Manage Students — full info, activate/deactivate, rejected ko accept */}
        {activeTab === 'manage-students' && (hasPermission('manage_users') || hasPermission('manage_students')) && renderManageTab('student', manageStudentsList)}

        {/* TAB: Admin Accounts & Permissions (superadmin only) */}
        {activeTab === 'admins' && isSuperAdmin && (
          <AdminManagement showToast={showToast} />
        )}

        {/* TAB 4: MASTER SITE CUSTOMIZER & SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="row g-4">
            {/* Left Category Sub-Tabs — Optimized Sidebar */}
            <div className="col-lg-3">
              <div
                className="akal-card sticky-top overflow-y-auto"
                style={{
                  top: `${navbarHeight + 8}px`,
                  maxHeight: `calc(100vh - ${navbarHeight + 8}px - 12px)`,
                  zIndex: 10,
                  borderRadius: '14px',
                  border: '1px solid rgba(8, 123, 181, 0.06)',
                }}
              >
                {/* Header */}
                <div
                  className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2"
                  style={{ borderBottom: '1px solid var(--akal-gray-200)' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'var(--grad-primary)',
                        boxShadow: '0 2px 8px rgba(8,123,181,0.25)',
                      }}
                    >
                      <Sliders size={13} className="text-white" />
                    </div>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.82rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                      Site Customizer
                    </span>
                  </div>
                  {unsavedCount > 0 && (
                    <span
                      className="badge rounded-pill fw-bold"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: '#fff',
                        fontSize: '0.62rem',
                        padding: '3px 8px',
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      {unsavedCount} unsaved
                    </span>
                  )}
                </div>

                {/* Grouped Navigation Items */}
                <div className="px-2 pt-2 pb-1">
                  {['appearance', 'content', 'advanced'].map((section, sIdx) => {
                    const sectionCats = settingsCategories.filter(c => c.section === section);
                    if (sectionCats.length === 0) return null;
                    return (
                      <div key={section} className={sIdx > 0 ? 'mt-1' : ''}>
                        {/* Section Label */}
                        <div
                          className="d-flex align-items-center gap-2 px-2 mb-1"
                          style={{ paddingTop: sIdx > 0 ? '6px' : '2px' }}
                        >
                          {sIdx > 0 && (
                            <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(90deg, var(--akal-gray-200), transparent)' }} />
                          )}
                          <span
                            className="text-uppercase fw-bold flex-shrink-0"
                            style={{
                              fontSize: '0.6rem',
                              color: 'var(--akal-gray-400)',
                              letterSpacing: '0.1em',
                            }}
                          >
                            {sectionLabels[section]}
                          </span>
                          <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--akal-gray-200), transparent)' }} />
                        </div>

                        {/* Category Buttons */}
                        <div className="d-flex flex-column gap-0">
                          {sectionCats.map((cat) => {
                            const IconComponent = cat.icon;
                            const isActive = settingsGroupTab === cat.key;
                            const count = settingsCountByGroup[cat.key] || 0;
                            return (
                              <button
                                key={cat.key}
                                className="btn btn-sm text-start border-0 d-flex align-items-center w-100 position-relative"
                                onClick={() => setSettingsGroupTab(cat.key)}
                                style={{
                                  padding: '7px 10px 7px 12px',
                                  borderRadius: '8px',
                                  gap: '9px',
                                  background: isActive ? 'linear-gradient(135deg, rgba(8,123,181,0.08), rgba(41,169,224,0.06))' : 'transparent',
                                  color: isActive ? 'var(--akal-blue-deep)' : 'var(--akal-gray-600)',
                                  fontWeight: isActive ? 700 : 500,
                                  fontSize: '0.78rem',
                                  transition: 'all 0.2s ease',
                                  borderLeft: isActive ? '3px solid var(--akal-blue)' : '3px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.background = 'var(--akal-gray-100)';
                                    e.currentTarget.style.color = 'var(--akal-gray-800)';
                                    e.currentTarget.style.borderLeftColor = 'var(--akal-gray-200)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--akal-gray-600)';
                                    e.currentTarget.style.borderLeftColor = 'transparent';
                                  }
                                }}
                              >
                                <div
                                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: '26px', height: '26px', borderRadius: '7px',
                                    background: isActive ? 'var(--grad-primary)' : 'var(--akal-gray-100)',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isActive ? '0 2px 6px rgba(8,123,181,0.2)' : 'none',
                                  }}
                                >
                                  <IconComponent size={13} style={{ color: isActive ? '#fff' : 'var(--akal-gray-400)' }} />
                                </div>
                                <span className="flex-grow-1 text-truncate">{cat.label}</span>
                                {count > 0 && (
                                  <span
                                    className="badge rounded-pill flex-shrink-0"
                                    style={{
                                      background: isActive ? 'rgba(8,123,181,0.15)' : 'var(--akal-gray-100)',
                                      color: isActive ? 'var(--akal-blue-deep)' : 'var(--akal-gray-400)',
                                      fontSize: '0.6rem',
                                      fontWeight: 600,
                                      padding: '2px 7px',
                                      minWidth: '22px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons Section */}
                <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--akal-gray-200)', marginTop: '4px' }}>
                  <div className="d-flex gap-2 mb-2">
                    <button
                      onClick={handlePreviewSite}
                      className="btn btn-sm flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                      title="Preview the site (changes not yet published)"
                      style={{
                        padding: '8px 0',
                        borderRadius: '8px',
                        background: 'var(--akal-white)',
                        border: '1.5px solid var(--akal-blue)',
                        color: 'var(--akal-blue)',
                        fontSize: '0.76rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--akal-blue-soft)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--akal-white)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="btn btn-sm flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                      style={{
                        padding: '8px 0',
                        borderRadius: '8px',
                        background: 'var(--grad-yellow)',
                        border: '1.5px solid var(--akal-yellow)',
                        color: 'var(--akal-navy)',
                        fontSize: '0.76rem',
                        boxShadow: '0 2px 8px rgba(249,185,0,0.3)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,185,0,0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,185,0,0.3)'; }}
                    >
                      <Save size={14} /> Publish
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-center">
                    {unsavedCount > 0 ? (
                      <div className="d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 600 }}>
                        <AlertCircle size={11} /> {unsavedCount} change{unsavedCount > 1 ? 's' : ''} pending
                        <span
                          className="ms-1"
                          role="button"
                          onClick={handleDiscardSettings}
                          style={{ color: 'var(--akal-gray-400)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                        >
                          Discard
                        </span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600 }}>
                        <CheckCircle2 size={11} /> All changes published
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Settings Form Fields */}
            <div className="col-lg-9">
              <div className="akal-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      {(() => {
                        const activeCat = settingsCategories.find(c => c.key === settingsGroupTab);
                        if (!activeCat) return 'Portal Details';
                        const ActiveIcon = activeCat.icon;
                        return (
                          <>
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: '30px', height: '30px', borderRadius: '9px',
                                background: 'var(--grad-primary)',
                                boxShadow: '0 2px 8px rgba(8,123,181,0.2)',
                              }}
                            >
                              <ActiveIcon size={15} className="text-white" />
                            </div>
                            {activeCat.label}
                          </>
                        );
                      })()}
                    </h5>
                    <span className="text-muted small">
                      Preview first to see how the site will look — changes go live only after you <strong>Save</strong>
                    </span>
                    {unsavedCount > 0 && (
                      <div>
                        <span className="badge bg-warning text-dark fw-bold mt-1">
                          <AlertCircle size={11} className="me-1" />
                          {unsavedCount} unsaved change{unsavedCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      onClick={handlePreviewSite}
                      className="btn btn-outline-primary fw-bold d-flex align-items-center gap-2"
                      title="Preview the site (changes not yet published)"
                    >
                      <Eye size={16} /> Preview
                    </button>
                    <button onClick={handleSaveSettings} className="btn btn-akal-yellow fw-bold d-flex align-items-center gap-2">
                      <Save size={16} /> Save Settings
                    </button>
                  </div>
                </div>

                {/* Live Real-Time DB Auto-Calculation Banner (Active when on stats tab) */}
                {settingsGroupTab === 'stats' && (
                  <div className="p-3 mb-4 rounded-3 border bg-white shadow-sm" style={{ borderLeft: '4px solid #10B981' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                          ⚡ LIVE DB ENGINE ACTIVE
                        </span>
                        <h6 className="mb-0 fw-bold text-dark">Real-Time Database Calculation Engine</h6>
                      </div>
                      <span className="badge bg-light text-dark border small">Auto-Syncs on every data change</span>
                    </div>
                    <p className="text-muted small mb-3">
                      Whenever any new user registers, an event is created, a job is posted, a chapter is added, or a mentor is approved, the portal automatically calculates and updates the real-time figures below.
                    </p>

                    <div className="row g-2 text-center">
                      <div className="col-md-3 col-6">
                        <div className="p-2 border rounded-3 bg-light">
                          <div className="fw-bold text-primary fs-5">{dashboardData?.metrics?.total_alumni || 0}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Total Alumni</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="p-2 border rounded-3 bg-light">
                          <div className="fw-bold text-success fs-5">{dashboardData?.metrics?.total_mentors || 0}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Live Mentors</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="p-2 border rounded-3 bg-light">
                          <div className="fw-bold text-warning fs-5">{chapters.length}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Active Chapters</div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="p-2 border rounded-3 bg-light">
                          <div className="fw-bold text-purple fs-5">{jobs.length}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Active Jobs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Group Settings List */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {filteredSettings.map((s) => (
                    <div key={s.setting_key} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap">
                        <strong className="text-dark small font-monospace">{s.setting_key}</strong>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-secondary-subtle text-secondary small">{s.setting_group}</span>
                          {s.setting_group === 'custom' && (
                            <button onClick={() => handleDeleteSetting(s.setting_key)} className="btn btn-link text-danger p-0 border-0" title="Delete custom setting">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-muted small mb-2">{s.description}</div>

                      {/* Checkbox / Switch for boolean 1/0 settings */}
                      {s.setting_value === '1' || s.setting_value === '0' || s.setting_key.startsWith('enable_') || s.setting_key.startsWith('allow_') || s.setting_key.startsWith('require_') ? (
                        <div className="form-check form-switch mt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`sw_${s.setting_key}`}
                            checked={s.setting_value === '1' || s.setting_value === 1}
                            onChange={(e) => handleSettingChange(s.setting_key, e.target.checked ? '1' : '0')}
                          />
                          <label className="form-check-label small fw-bold" htmlFor={`sw_${s.setting_key}`}>
                            {s.setting_value === '1' || s.setting_value === 1 ? 'Enabled (Active on site)' : 'Disabled (Hidden on site)'}
                          </label>
                        </div>
                      ) : s.setting_key.includes('description') || s.setting_key.includes('address') || s.setting_key.includes('text') && s.setting_value?.length > 60 || s.setting_key.startsWith('about_') || s.setting_key.startsWith('auaa_') ? (
                        <>
                          {HTML_TEXT_KEYS.has(s.setting_key) && (
                            <div className="alert alert-info py-2 px-3 mb-2 small">
                              <strong>Simple editor:</strong> no tags needed — separate paragraphs with a blank line, use <code>**text**</code> for <strong>bold</strong>.
                            </div>
                          )}
                          <textarea
                            className="form-control"
                            style={HTML_TEXT_KEYS.has(s.setting_key) ? { fontFamily: 'var(--font-body)' } : { fontFamily: 'monospace', fontSize: '0.82rem' }}
                            rows={s.setting_value && String(s.setting_value).split('\n').length > 8 ? 10 : s.setting_value && String(s.setting_value).length > 300 ? 8 : 4}
                            value={HTML_TEXT_KEYS.has(s.setting_key) ? htmlToPlain(s.setting_value) : (s.setting_value || '')}
                            onChange={(e) => handleSettingChange(s.setting_key, HTML_TEXT_KEYS.has(s.setting_key) ? plainToHtml(e.target.value) : e.target.value)}
                          />
                        </>
                      ) : s.setting_key.includes('color') ? (
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            className="form-control form-control-color"
                            value={s.setting_value || '#087BB5'}
                            onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm font-monospace"
                            value={s.setting_value || ''}
                            onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          value={s.setting_value || ''}
                          onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  {filteredSettings.length === 0 && (
                    <div className="text-center py-4 text-muted small p-4 bg-light rounded-3 border">
                      <p className="mb-2 fw-semibold">No settings added yet in this category.</p>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <button
                          onClick={loadFallbackSettings}
                          className="btn btn-sm btn-outline-primary"
                        >
                          🔄 Reload Official Settings
                        </button>
                        {!authLoading && !isAdmin && (
                          <button
                            onClick={async () => {
                              await quickDemoLogin('superadmin@akaluniversity.ac.in', 'Admin@12345');
                              showToast('⚡ Logged in as Super Admin! All edit options unlocked.');
                            }}
                            className="btn btn-sm btn-primary fw-bold"
                          >
                            <Sparkles size={14} className="me-1" /> 1-Click Super Admin Login
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Custom Site Parameter Form */}
                <div className="p-3 bg-white rounded-3 border mt-4">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <PlusCircle size={16} className="text-primary" />
                    <span>Add New Custom Site Detail / Parameter</span>
                  </h6>
                  <p className="text-muted small mb-3">
                    As Super Admin, you can add any dynamic parameter key-value pair to inject into templates, custom footers, or API endpoints.
                  </p>

                  <form onSubmit={handleAddCustomSetting}>
                    <div className="row g-2 mb-2">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control form-control-sm font-monospace"
                          placeholder="setting_key (e.g. dean_welcome_note)"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Setting Value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-select form-select-sm"
                          value={newGroup}
                          onChange={(e) => setNewGroup(e.target.value)}
                        >
                          <option value="general">general</option>
                          <option value="hero">hero</option>
                          <option value="banner">banner</option>
                          <option value="stats">stats</option>
                          <option value="contact">contact</option>
                          <option value="social">social</option>
                          <option value="footer">footer</option>
                          <option value="features">features</option>
                          <option value="custom">custom</option>
                        </select>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Description of this parameter..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                      />
                      <button type="submit" className="btn btn-sm btn-primary text-nowrap">
                        Add Parameter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CMS TAB: Success Stories Management */}
        {activeTab === 'cms-stories' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage Alumni Success Stories</h5>
              <button
                onClick={() => setEditingStory({ title: '', summary: '', content: '', batch_year: '', company: '', designation: '', is_featured: 1, is_published: 1 })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Add New Story
              </button>
            </div>

            {/* Story Editor Modal/Inline Form */}
            {editingStory && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingStory.id ? 'Edit Story' : 'Create New Success Story'}</h6>
                <form onSubmit={handleSaveStory}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Story Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingStory.title}
                        onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Batch Year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingStory.batch_year || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, batch_year: e.target.value })}
                        placeholder="e.g. 2016-2020"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Company / Organization</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingStory.company || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, company: e.target.value })}
                        placeholder="e.g. Google Cloud"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingStory.designation || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, designation: e.target.value })}
                        placeholder="e.g. Senior Cloud Architect"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Short Summary</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingStory.summary || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, summary: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Story Content</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editingStory.content || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-4 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="stFeat"
                        checked={editingStory.is_featured === 1 || editingStory.is_featured === '1'}
                        onChange={(e) => setEditingStory({ ...editingStory, is_featured: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="stFeat">Featured Spotlight</label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="stPub"
                        checked={editingStory.is_published === 1 || editingStory.is_published === '1'}
                        onChange={(e) => setEditingStory({ ...editingStory, is_published: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="stPub">Published on Live Site</label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Story</button>
                    <button type="button" onClick={() => setEditingStory(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Stories Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Title & Alumni</th>
                    <th>Company & Role</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div className="fw-bold">{st.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '350px' }}>{st.summary}</div>
                      </td>
                      <td>{st.company} • {st.designation}</td>
                      <td>{st.batch_year}</td>
                      <td>
                        {st.is_featured ? <span className="badge bg-warning text-dark me-1">Featured</span> : null}
                        <span className={`badge ${st.is_published ? 'bg-success' : 'bg-secondary'}`}>
                          {st.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button onClick={() => setEditingStory(st)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteStory(st.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS TAB: News & Notices */}
        {activeTab === 'cms-news' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage News & University Announcements</h5>
              <button
                onClick={() => setEditingNews({ title: '', category: 'Announcement', content: '', is_pinned: 0, is_published: 1 })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Post Announcement
              </button>
            </div>

            {editingNews && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingNews.id ? 'Edit Notice' : 'New University Notice / News'}</h6>
                <form onSubmit={handleSaveNews}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Headline *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingNews.title}
                        onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select"
                        value={editingNews.category || 'General'}
                        onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                      >
                        <option value="Announcement">Announcement</option>
                        <option value="Awards">Awards</option>
                        <option value="Reunion">Reunion</option>
                        <option value="Academic">Academic</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Notice Content</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editingNews.content || ''}
                      onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="d-flex align-items-center gap-4 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="nwPin"
                        checked={editingNews.is_pinned === 1 || editingNews.is_pinned === '1'}
                        onChange={(e) => setEditingNews({ ...editingNews, is_pinned: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="nwPin">📌 Pin to Top</label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="nwPub"
                        checked={editingNews.is_published === 1 || editingNews.is_published === '1'}
                        onChange={(e) => setEditingNews({ ...editingNews, is_published: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="nwPub">Published on Live Portal</label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Notice</button>
                    <button type="button" onClick={() => setEditingNews(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Published At</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <div className="fw-bold">{n.is_pinned ? '📌 ' : ''}{n.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '400px' }}>{n.content}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{n.category}</span></td>
                      <td>
                        <span className={`badge ${n.is_published ? 'bg-success' : 'bg-secondary'}`}>
                          {n.is_published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(n.published_at || n.created_at).toLocaleDateString()}</td>
                      <td className="text-end">
                        <button onClick={() => setEditingNews(n)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteNews(n.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS TAB: Events Management */}
        {activeTab === 'cms-events' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage Events & Reunions</h5>
              <button
                onClick={() => setEditingEvent({ title: '', event_type: 'reunion', venue: '', start_datetime: '', description: '', is_virtual: 0, is_published: 1 })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Create Event
              </button>
            </div>

            {editingEvent && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingEvent.id ? 'Edit Event' : 'Create New Event / Reunion'}</h6>
                <form onSubmit={handleSaveEvent}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Event Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select"
                        value={editingEvent.event_type || 'reunion'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                      >
                        <option value="reunion">Reunion</option>
                        <option value="webinar">Webinar</option>
                        <option value="conference">Conference</option>
                        <option value="meetup">Meetup</option>
                        <option value="sports">Sports</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editingEvent.start_datetime ? editingEvent.start_datetime.substring(0, 16) : ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, start_datetime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Venue / Link</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingEvent.venue || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                        placeholder="e.g. Main Auditorium / Zoom Link"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-4 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="evVirt"
                        checked={editingEvent.is_virtual === 1 || editingEvent.is_virtual === '1'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, is_virtual: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="evVirt">Virtual Event (Online Broadcast)</label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="evPub"
                        checked={editingEvent.is_published === 1 || editingEvent.is_published === '1'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, is_published: e.target.checked ? 1 : 0 })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="evPub">Published</label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Event</button>
                    <button type="button" onClick={() => setEditingEvent(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div className="fw-bold">{ev.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>{ev.description}</div>
                      </td>
                      <td><span className="badge bg-primary-subtle text-primary text-uppercase">{ev.event_type}</span></td>
                      <td>{new Date(ev.start_datetime).toLocaleString()}</td>
                      <td>{ev.venue}</td>
                      <td>
                        <span className={`badge ${ev.is_published ? 'bg-success' : 'bg-secondary'}`}>
                          {ev.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button onClick={() => setEditingEvent(ev)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS TAB: Regional Chapters */}
        {activeTab === 'cms-chapters' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage Regional & International Chapters</h5>
              <button
                onClick={() => setEditingChapter({ name: '', city: '', state: '', country: 'India', description: '', member_count: 50, is_active: 1 })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Add Chapter
              </button>
            </div>

            {editingChapter && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingChapter.id ? 'Edit Chapter' : 'Add New Regional Hub'}</h6>
                <form onSubmit={handleSaveChapter}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Chapter Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingChapter.name}
                        onChange={(e) => setEditingChapter({ ...editingChapter, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingChapter.city}
                        onChange={(e) => setEditingChapter({ ...editingChapter, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingChapter.country || 'India'}
                        onChange={(e) => setEditingChapter({ ...editingChapter, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingChapter.description || ''}
                        onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Member Count</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingChapter.member_count || 0}
                        onChange={(e) => setEditingChapter({ ...editingChapter, member_count: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Chapter</button>
                    <button type="button" onClick={() => setEditingChapter(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Chapter</th>
                    <th>Location</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((ch) => (
                    <tr key={ch.id}>
                      <td>
                        <div className="fw-bold">{ch.name}</div>
                        <div className="text-muted small">{ch.description}</div>
                      </td>
                      <td>{ch.city}, {ch.country}</td>
                      <td><span className="badge bg-primary">{ch.member_count} Members</span></td>
                      <td><span className="badge bg-success">Active</span></td>
                      <td className="text-end">
                        <button onClick={() => setEditingChapter(ch)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteChapter(ch.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS TAB: Jobs & Careers */}
        {activeTab === 'cms-jobs' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage Career Opportunities & Jobs</h5>
              <button
                onClick={() => setEditingJob({ title: '', company_name: '', job_type: 'full_time', location: '', salary_range: '', description: '', apply_link: '', status: 'approved' })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Post New Opportunity
              </button>
            </div>

            {editingJob && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingJob.id ? 'Edit Opportunity' : 'Post New Opportunity'}</h6>
                <form onSubmit={handleSaveJob}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Job Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingJob.title}
                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Company *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingJob.company_name}
                        onChange={(e) => setEditingJob({ ...editingJob, company_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Job Type</label>
                      <select
                        className="form-select"
                        value={editingJob.job_type || 'full_time'}
                        onChange={(e) => setEditingJob({ ...editingJob, job_type: e.target.value })}
                      >
                        <option value="full_time">Full Time</option>
                        <option value="internship">Internship</option>
                        <option value="part_time">Part Time</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingJob.location || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Salary / Compensation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingJob.salary_range || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, salary_range: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description & Responsibilities</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingJob.description || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="flex-grow-1">
                      <label className="form-label small fw-bold">Application Link / Email</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingJob.apply_link || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, apply_link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div style={{ width: '160px' }}>
                      <label className="form-label small fw-bold">Status</label>
                      <select
                        className="form-select"
                        value={editingJob.status || 'approved'}
                        onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Job</button>
                    <button type="button" onClick={() => setEditingJob(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Role & Company</th>
                    <th>Type & Location</th>
                    <th>Compensation</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td>
                        <div className="fw-bold">{j.title}</div>
                        <div className="text-muted small">{j.company_name}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border me-1">{j.job_type}</span>
                        <span>{j.location}</span>
                      </td>
                      <td className="text-success fw-semibold">{j.salary_range}</td>
                      <td>
                        <span className={`badge ${j.status === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button onClick={() => setEditingJob(j)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteJob(j.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS TAB: Gallery Albums */}
        {activeTab === 'cms-gallery' && (
          <div className="akal-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Manage Campus Photo Gallery & Albums</h5>
              <button
                onClick={() => setEditingGallery({ title: '', category: 'Campus', description: '', event_date: new Date().toISOString().substring(0, 10), is_published: 1 })}
                className="btn btn-sm btn-akal-primary d-flex align-items-center gap-1"
              >
                <PlusCircle size={14} /> Create Album
              </button>
            </div>

            {editingGallery && (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold mb-3">{editingGallery.id ? 'Edit Album' : 'Create Gallery Album'}</h6>
                <form onSubmit={handleSaveGallery}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Album Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingGallery.title}
                        onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select"
                        value={editingGallery.category || 'Campus'}
                        onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                      >
                        <option value="Convocation">Convocation</option>
                        <option value="Reunion">Reunion</option>
                        <option value="Campus">Campus</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editingGallery.description || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-akal-primary">Save Album</button>
                    <button type="button" onClick={() => setEditingGallery(null)} className="btn btn-light border">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Album Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gallery.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <div className="fw-bold">{g.title}</div>
                        <div className="text-muted small">{g.description}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{g.category}</span></td>
                      <td className="text-muted">{g.event_date}</td>
                      <td><span className="badge bg-success">Published</span></td>
                      <td className="text-end">
                        <button onClick={() => setEditingGallery(g)} className="btn btn-sm btn-outline-primary me-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteGallery(g.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="akal-card p-4">
            <h5 className="fw-bold text-dark mb-3">System Security & Operation Audit Trail</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Role</th>
                    <th>Module</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="fw-bold text-primary font-monospace">{log.action}</td>
                      <td><span className="badge bg-light text-dark border text-uppercase">{log.user_role}</span></td>
                      <td>{log.target_module}</td>
                      <td className="font-monospace text-muted">{log.ip_address}</td>
                      <td className="small text-secondary">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Full Info Modal — kisi bhi user (alumni / student / admin) ki poori detail */}
        {detailUserId && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(13,22,34,0.7)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeUserDetail(); }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '1100px', width: '96%', maxHeight: '92vh', margin: 'auto' }}>
              <div
                className="modal-content border-0 overflow-hidden shadow-lg"
                style={{ borderRadius: '22px', boxShadow: '0 30px 80px rgba(13,22,34,0.5)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              >
                {/* ── Premium profile header — cover art + avatar ring + headline (NEVER shrinks) ── */}
                <div
                  className="position-relative overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(120deg,#0D1622 0%,#075985 45%,#087BB5 75%,#29A9E0 100%)', flexShrink: 0 }}
                >
                  <div className="position-absolute rounded-circle" style={{ width: '220px', height: '220px', top: '-110px', right: '60px', background: 'radial-gradient(circle, rgba(249,185,0,0.35) 0%, transparent 70%)' }}></div>
                  <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', bottom: '-190px', left: '-80px', background: 'radial-gradient(circle, rgba(41,169,224,0.35) 0%, transparent 70%)' }}></div>
                  <div className="position-relative d-flex align-items-center gap-3 p-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden fw-bold flex-shrink-0"
                      style={{
                        width: '80px', height: '80px', fontSize: '1.55rem',
                        background: detailData && detailData.alumni && detailData.alumni.profile_photo ? '#fff' : 'var(--grad-yellow)',
                        color: 'var(--akal-navy)', border: `4px solid ${detailData ? statusRingColor(detailData.user.status) : '#fff'}`,
                        boxShadow: '0 10px 28px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.15)',
                      }}
                    >
                      {detailData && detailData.alumni && detailData.alumni.profile_photo ? (
                        <img src={detailData.alumni.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (() => {
                          const p = detailData && (detailData.alumni || detailData.student || detailData.admin_profile);
                          const nm = p ? `${p.first_name || p.full_name || ''} ${p.last_name || ''}`.trim() : '';
                          return (nm || (detailData ? detailData.user.email : 'U')).replace(/[^A-Za-z ]/g, '').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
                        })()
                      )}
                    </div>
                    <div className="flex-grow-1 text-white" style={{ minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="fw-bold mb-0 text-white text-break" style={{ fontFamily: 'var(--font-heading)' }}>
                          {detailData ? (
                            (() => {
                              const p = detailData.alumni || detailData.student || detailData.admin_profile;
                              const nm = p ? `${p.first_name || p.full_name || ''} ${p.last_name || ''}`.trim() : '';
                              return nm || detailData.user.email;
                            })()
                          ) : 'Loading profile…'}
                        </h5>
                        {detailData && (
                          <span className="badge rounded-pill px-2 py-1" style={{ background: 'var(--grad-yellow)', color: 'var(--akal-navy)', fontSize: '0.62rem', fontWeight: 800 }}>
                            {detailData.user.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {detailData && (() => {
                        const hd = detailData.alumni
                          ? [detailData.alumni.current_designation, detailData.alumni.current_company].filter(Boolean).join(' @ ')
                          : (detailData.student ? [detailData.student.degree, detailData.student.department].filter(Boolean).join(' • ') : detailData.admin_profile?.designation);
                        return (
                          <>
                            {hd && <div className="fw-semibold text-truncate mt-1" style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.9)' }}>{hd}</div>}
                            <div className="d-flex align-items-center gap-2 flex-wrap mt-1" style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.78)' }}>
                              <span className="d-inline-flex align-items-center gap-1"><Mail size={12} />{detailData.user.email}</span>
                              <span style={{ opacity: 0.5 }}>•</span>
                              <span>User #{detailData.user.id}</span>
                            </div>
                          </>
                        );
                      })()}
                      {detailData && (
                        <div className="d-flex gap-2 flex-wrap mt-2">
                          <span className="badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', fontSize: '0.7rem' }}>
                            <span className="rounded-circle d-inline-block" style={{ width: '7px', height: '7px', background: statusRingColor(detailData.user.status) }}></span>
                            {detailData.user.status.toUpperCase()}
                          </span>
                          <span className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', fontSize: '0.7rem' }}>
                            ID: {detailData.user.verification_status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button type="button" className="btn-close btn-close-white flex-shrink-0 align-self-start mt-1" onClick={closeUserDetail} aria-label="Close"></button>
                  </div>
                  {detailData && (
                    <div style={{ height: '4px', background: `linear-gradient(90deg, ${statusRingColor(detailData.user.status)}, var(--akal-yellow) 60%, transparent)` }}></div>
                  )}
                </div>

                {/* ── Scrollable Body with Clean Responsive 2-Column Grid ── */}
                <div className="modal-body p-4" style={{ background: 'linear-gradient(180deg, var(--akal-bg-light) 0%, #EDF3FA 100%)', overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
                  {detailLoading && (
                    <div className="text-center py-5">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', background: 'var(--akal-white)', boxShadow: 'var(--shadow-md)' }}>
                        <div className="spinner-border" style={{ color: 'var(--akal-blue)' }} role="status"></div>
                      </div>
                      <div className="fw-bold" style={{ color: 'var(--akal-navy)' }}>Fetching full profile…</div>
                      <div className="small" style={{ color: 'var(--akal-gray-400)' }}>Contact, academics, ID card & activity</div>
                    </div>
                  )}

                  {!detailLoading && detailData && (
                    (() => {
                      const du = detailData.user;
                      const al = detailData.alumni;
                      const st = detailData.student;
                      const adm = detailData.admin_profile;
                      const hasRightCol = !!(
                        detailData.id_card ||
                        (detailData.educations && detailData.educations.length > 0) ||
                        (detailData.recent_activity && detailData.recent_activity.length > 0)
                      );

                      return (
                        <div className="row g-3">
                          {/* ── Left Column: Personal, Contact & Career Details ── */}
                          <div className={hasRightCol ? 'col-lg-7 col-12' : 'col-12'}>
                            <div className="rounded-4 p-3 mb-3 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                              {akalSectionHead(Layers, 'Personal & Contact Details')}
                              <div className="row g-2">
                                <InfoTile icon={Mail} label="Email Address" value={du.email} />
                                <InfoTile icon={Clock} label="Registered On" value={du.created_at ? new Date(du.created_at).toLocaleString() : ''} />
                                {al && (<>
                                  <InfoTile icon={Hash} label="AUID" value={al.auid} />
                                  <InfoTile icon={CreditCard} label="Alumni ID" value={al.alumni_id} />
                                  <InfoTile icon={Phone} label="Phone" value={al.phone} />
                                  <InfoTile icon={GraduationCap} label="Degree" value={al.degree} />
                                  <InfoTile icon={BookOpen} label="Department" value={al.department} />
                                  <InfoTile icon={Calendar} label="Batch" value={al.batch_year} />
                                  <InfoTile icon={MapPin} label="Location" value={[al.location_city, al.location_country].filter(Boolean).join(', ')} />
                                  <InfoTile icon={Link2} label="LinkedIn" value={al.linkedin_url} link />
                                  <InfoTile icon={Activity} label="Mentor" value={al.is_mentor == 1 ? '⭐ Yes — volunteering' : 'No'} />
                                  <InfoTile icon={CheckCircle2} label="Public Profile" value={al.is_public_profile == 1 ? '👁 Visible in directory' : '🔒 Hidden'} />
                                  <InfoTile icon={ShieldCheck} label="Verified At" value={al.verified_at ? new Date(al.verified_at).toLocaleString() : ''} />
                                </>)}
                                {st && (<>
                                  <InfoTile icon={Users} label="Full Name" value={`${st.first_name || ''} ${st.last_name || ''}`.trim()} />
                                  <InfoTile icon={Hash} label="Enrollment No" value={st.enrollment_no} />
                                  <InfoTile icon={GraduationCap} label="Degree" value={st.degree} />
                                  <InfoTile icon={BookOpen} label="Department" value={st.department} />
                                  <InfoTile icon={Calendar} label="Year / Semester" value={`${st.current_year || '—'} / ${st.semester || '—'}`} />
                                  <InfoTile icon={Phone} label="Phone" value={st.phone} />
                                </>)}
                                {adm && (<>
                                  <InfoTile icon={Users} label="Full Name" value={adm.full_name} />
                                  <InfoTile icon={Briefcase} label="Designation" value={adm.designation} />
                                  <InfoTile icon={Phone} label="Phone" value={adm.phone} />
                                </>)}
                              </div>
                            </div>

                            {/* Career & Skills for Alumni */}
                            {al && (al.current_company || al.current_designation || al.skills || al.bio || al.admin_notes) && (
                              <div className="rounded-4 p-3 mb-3 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                                {akalSectionHead(Briefcase, 'Career & Professional Profile')}
                                <div className="row g-2">
                                  <InfoTile icon={Building2} label="Current Company" value={al.current_company} />
                                  <InfoTile icon={Briefcase} label="Current Designation" value={al.current_designation} />
                                  {al.skills && (
                                    <div className="col-12 mt-2">
                                      <div className="rounded-3 p-2" style={{ background: 'var(--akal-blue-soft)', border: '1px dashed var(--akal-blue)' }}>
                                        <div className="text-uppercase fw-bold mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.62rem', color: 'var(--akal-blue-deep)', letterSpacing: '0.06em' }}>
                                          <Sparkles size={12} /> Skills & Expertise
                                        </div>
                                        <div className="d-flex flex-wrap gap-1">
                                          {String(al.skills).split(',').map((s, i) => (
                                            <span key={i} className="badge rounded-pill px-2 py-1 bg-white border" style={{ color: 'var(--akal-navy)', fontSize: '0.7rem', fontWeight: 600 }}>{s.trim()}</span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {al.bio && (
                                    <div className="col-12 mt-2">
                                      <div className="rounded-3 p-2 ps-3" style={{ background: 'var(--akal-yellow-soft)', borderLeft: '4px solid var(--akal-yellow)' }}>
                                        <div className="text-uppercase fw-bold" style={{ fontSize: '0.62rem', color: '#92400E', letterSpacing: '0.06em' }}>💬 Professional Bio</div>
                                        <div className="fst-italic" style={{ fontSize: '0.84rem', color: 'var(--akal-navy)' }}>“{al.bio}”</div>
                                      </div>
                                    </div>
                                  )}
                                  {al.admin_notes && (
                                    <div className="col-12 mt-2">
                                      <div className="rounded-3 p-2 d-flex gap-2 align-items-start" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                        <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '30px', height: '30px', background: '#DC2626' }}>
                                          <AlertCircle size={15} className="text-white" />
                                        </span>
                                        <div>
                                          <div className="fw-bold" style={{ fontSize: '0.72rem', color: '#B91C1C' }}>REJECTION REASON BY ADMIN</div>
                                          <div className="fw-semibold" style={{ fontSize: '0.84rem', color: '#7F1D1D' }}>{al.admin_notes}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Student Career Interests */}
                            {st && st.career_interests && (
                              <div className="rounded-4 p-3 mb-3 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                                {akalSectionHead(Briefcase, 'Career Interests')}
                                <div className="rounded-3 p-2" style={{ background: 'var(--akal-blue-soft)', border: '1px dashed var(--akal-blue)' }}>
                                  <div className="d-flex flex-wrap gap-1">
                                    {String(st.career_interests).split(',').map((s, i) => (
                                      <span key={i} className="badge rounded-pill px-2 py-1 bg-white border" style={{ color: 'var(--akal-navy)', fontSize: '0.7rem', fontWeight: 600 }}>{s.trim()}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Admin Permissions */}
                            {adm && (
                              <div className="rounded-4 p-3 mb-3 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                                {akalSectionHead(Lock, 'Access Permissions')}
                                <div className="rounded-3 p-2" style={{ background: 'var(--akal-navy)', border: '1px solid var(--akal-navy)' }}>
                                  <div className="d-flex flex-wrap gap-1 align-items-center">
                                    {du.role === 'superadmin' ? (
                                      <span className="badge rounded-pill px-3 py-1" style={{ background: 'var(--grad-yellow)', color: 'var(--akal-navy)', fontWeight: 800 }}>👑 ALL — Super Admin</span>
                                    ) : (Object.keys(adm.permissions || {}).length > 0
                                      ? Object.keys(adm.permissions).map((p) => (
                                          <span key={p} className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.68rem' }}>✓ {p}</span>
                                        ))
                                      : <span className="badge bg-secondary rounded-pill">None granted</span>)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ── Right Column: Digital ID Card, Academic Journey & Recent Activity ── */}
                          {hasRightCol && (
                            <div className="col-lg-5 col-12">
                              {/* Digital ID Card Preview */}
                              {detailData.id_card && (
                                <div className="rounded-4 p-3 mb-3 position-relative overflow-hidden text-white" style={{ background: 'linear-gradient(120deg,#0D1622 0%,#172333 45%,#075985 100%)', boxShadow: '0 14px 34px rgba(13,22,34,0.35)', border: '1px solid rgba(249,185,0,0.35)' }}>
                                  <div className="position-absolute rounded-circle" style={{ width: '260px', height: '260px', top: '-140px', right: '-60px', background: 'radial-gradient(circle, rgba(249,185,0,0.28) 0%, transparent 70%)' }}></div>
                                  <div className="position-absolute rounded-circle" style={{ width: '200px', height: '200px', bottom: '-120px', left: '30%', background: 'radial-gradient(circle, rgba(41,169,224,0.25) 0%, transparent 70%)' }}></div>
                                  <div className="position-relative d-flex justify-content-between align-items-start gap-3">
                                    <div style={{ minWidth: 0 }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="d-inline-flex align-items-center justify-content-center rounded-2" style={{ width: '28px', height: '28px', background: 'var(--grad-yellow)' }}>
                                          <Award size={15} style={{ color: 'var(--akal-navy)' }} />
                                        </span>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--akal-yellow)' }}>AKAL UNIVERSITY • ALUMNI ID</div>
                                      </div>
                                      <div className="fw-bold font-monospace mt-2" style={{ fontSize: '1.2rem', letterSpacing: '0.08em', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{detailData.id_card.card_number}</div>
                                      <div className="d-flex gap-2 flex-wrap mt-1" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>
                                        <span>Issued: {detailData.id_card.issue_date}</span>
                                        <span>Expires: {detailData.id_card.expiry_date}</span>
                                      </div>
                                      <div className="mt-2">
                                        <span className="badge rounded-pill px-2 py-1" style={{ background: detailData.id_card.status === 'active' ? '#22C55E' : '#F59E0B', color: '#fff', fontSize: '0.62rem' }}>{String(detailData.id_card.status).toUpperCase()}</span>
                                      </div>
                                    </div>
                                    <div className="text-end flex-shrink-0">
                                      <div className="rounded-2 mx-auto" style={{ width: '38px', height: '28px', background: 'linear-gradient(135deg,#FFDF78,#D49800)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)' }}></div>
                                      <QrCode size={34} className="mt-2" style={{ color: 'rgba(255,255,255,0.85)' }} />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Academic Journey */}
                              {detailData.educations && detailData.educations.length > 0 && (
                                <div className="rounded-4 p-3 mb-3 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                                  {akalSectionHead(GraduationCap, 'Academic Journey', detailData.educations.length)}
                                  <div className="d-flex flex-column gap-2">
                                    {detailData.educations.map((ed) => (
                                      <div key={ed.id} className="rounded-3 p-2 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--akal-blue-soft) 0%, #fff 70%)', border: '1px solid var(--akal-gray-200)' }}>
                                        <div className="position-absolute" style={{ width: '4px', top: 0, bottom: 0, left: 0, background: ed.status === 'completed' ? '#22C55E' : 'var(--akal-blue)' }}></div>
                                        <div className="d-flex align-items-center gap-2 mb-1 ps-1">
                                          <span className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style={{ width: '28px', height: '28px', background: 'var(--grad-primary)' }}>
                                            <Landmark size={13} className="text-white" />
                                          </span>
                                          <div className="fw-bold text-truncate" style={{ fontSize: '0.82rem', color: 'var(--akal-navy)' }}>{ed.degree_name}</div>
                                        </div>
                                        <div className="ps-1" style={{ fontSize: '0.74rem', color: 'var(--akal-gray-600)' }}>
                                          <div className="text-truncate">{ed.department} {ed.enrollment_no ? <span className="font-monospace">• {ed.enrollment_no}</span> : ''}</div>
                                          <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                                            <span className="badge rounded-pill px-2" style={{ background: 'var(--grad-yellow)', color: 'var(--akal-navy)', fontSize: '0.64rem' }}>{ed.education_level}</span>
                                            <span style={{ fontSize: '0.7rem' }}>📅 {ed.start_year} – {ed.end_year || (ed.status === 'ongoing' ? 'Pursuing' : '—')}</span>
                                            <span className={`badge rounded-pill px-2 ${ed.status === 'completed' ? 'bg-success' : 'bg-info'}`} style={{ fontSize: '0.64rem' }}>{ed.status}</span>
                                            {ed.grade && <span className="fw-bold" style={{ color: 'var(--akal-blue-deep)', fontSize: '0.72rem' }}>🎓 {ed.grade}</span>}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recent Activity */}
                              {detailData.recent_activity && detailData.recent_activity.length > 0 && (
                                <div className="rounded-4 p-3 mb-1 bg-white" style={{ border: '1px solid var(--akal-gray-200)', boxShadow: 'var(--shadow-md)' }}>
                                  {akalSectionHead(Clock, 'Recent Activity', detailData.recent_activity.length)}
                                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                    {detailData.recent_activity.map((log) => (
                                      <div key={log.id} className="d-flex gap-2 align-items-start rounded-3 p-2" style={{ background: 'var(--akal-bg-light)', border: '1px solid var(--akal-gray-200)' }}>
                                        <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 mt-1" style={{ width: '8px', height: '8px', background: 'var(--akal-blue)', boxShadow: '0 0 0 3px var(--akal-blue-soft)' }}></span>
                                        <div style={{ minWidth: 0 }}>
                                          <div className="fw-bold" style={{ fontSize: '0.8rem', color: 'var(--akal-navy)' }}>{log.action}</div>
                                          {log.details && <div className="text-truncate" style={{ fontSize: '0.74rem', color: 'var(--akal-gray-600)' }}>{log.details}</div>}
                                          <div style={{ fontSize: '0.68rem', color: 'var(--akal-gray-400)' }}>🕒 {log.created_at ? new Date(log.created_at).toLocaleString() : ''}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* ── Fixed Solid Footer (flex-shrink: 0, NEVER overlaps content) ── */}
                <div
                  className="modal-footer px-4 py-3 flex-wrap gap-2 align-items-center flex-shrink-0"
                  style={{ borderTop: '1px solid var(--akal-gray-200)', background: '#FFFFFF', flexShrink: 0, zIndex: 10 }}
                >
                  {detailData && (() => {
                    const du = detailData.user;
                    const flagged = needsAction(du);
                    return (
                      <>
                        {flagged && (
                          <span className="badge rounded-pill px-3 py-2 me-auto d-inline-flex align-items-center gap-1" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontSize: '0.72rem' }}>
                            <AlertCircle size={13} />
                            Needs approval — account is not active yet
                          </span>
                        )}
                        {!flagged && <span className="me-auto" />}
                        {flagged && (
                          <button className="btn btn-sm fw-bold d-flex align-items-center gap-1 px-3 py-2 rounded-pill" style={{ background: 'var(--grad-yellow)', color: 'var(--akal-navy)', border: 'none', boxShadow: '0 4px 14px rgba(249,185,0,0.35)' }} onClick={() => handleAcceptUser(du)}>
                            <UserCheck size={14} /> Accept & Activate
                          </button>
                        )}
                        <button
                          className="btn btn-sm fw-semibold d-flex align-items-center gap-1 px-3 py-2 rounded-pill text-white border-0"
                          style={{ background: du.status === 'active' ? 'linear-gradient(135deg,#DC2626,#991B1B)' : 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: 'var(--shadow-sm)' }}
                          onClick={() => handleStatusChange(du.id, du.status === 'active' ? 'suspended' : 'active')}
                        >
                          {du.status === 'active' ? <><Lock size={13} /> Deactivate</> : <><CheckCircle2 size={13} /> Activate</>}
                        </button>
                        <button className="btn btn-sm fw-semibold px-3 py-2 rounded-pill" style={{ background: 'var(--akal-white)', border: '1px solid var(--akal-gray-200)', color: 'var(--akal-gray-600)' }} onClick={closeUserDetail}>Close</button>
                      </>
                    );
                  })()}
                  {!detailData && (
                    <button className="btn btn-sm btn-secondary" onClick={closeUserDetail}>Close</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
