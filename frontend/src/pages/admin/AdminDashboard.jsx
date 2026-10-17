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
  LogIn
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Complete metadata dictionary for all University System Settings
const DEFAULT_SETTINGS_METADATA = {
  // General Branding & Identity
  site_title: { group: 'general', description: 'Platform display title' },
  university_name: { group: 'general', description: 'Official University Name' },
  tagline: { group: 'general', description: 'Portal Tagline / Subtitle' },
  logo_text: { group: 'general', description: 'Navbar Brand Title' },
  logo_subtext: { group: 'general', description: 'Navbar Brand Subtitle' },
  // About University Content (Navbar "About")
  about_akal_university: { group: 'about', description: 'About page content (Navbar → About)' },
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
        setSettings(fallbackList);
        const snapshot = {};
        fallbackList.forEach(s => { snapshot[s.setting_key] = s.setting_value; });
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
        setSettings(settRes.value.data);
        const snapshot = {};
        settRes.value.data.forEach(s => { snapshot[s.setting_key] = s.setting_value; });
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

  // Verification approvals
  const handleApprove = async (userId) => {
    if (!hasPermission('verify_alumni')) { alert('You do not have verification permission'); return; }
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
    if (!hasPermission('verify_alumni')) { alert('You do not have verification permission'); return; }
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

  const handleStatusChange = async (userId, newStatus) => {
    if (!isSuperAdmin) { alert('Only Super Admin can change account status'); return; }
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.status) {
        showToast(`User account set to ${newStatus.toUpperCase()}!`);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

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
        showToast('All site details saved — ab ye website par LIVE hain!');
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
      showToast('Preview naye tab me khul gaya — changes abhi publish nahi hue.');
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

  // Settings group categories
  const settingsCategories = [
    { key: 'general', label: '🎨 Branding & Identity', icon: Palette },
    { key: 'banner', label: '📢 Announcement Banner', icon: Bell },
    { key: 'hero', label: '🚀 Homepage Hero Customizer', icon: Sparkles },
    { key: 'stats', label: '📊 Key Statistics & Counters', icon: Activity },
    { key: 'contact', label: '📞 Contacts & Campus Info', icon: Phone },
    { key: 'social', label: '🌐 Social Links & Handles', icon: Share2 },
    { key: 'footer', label: '🏛️ Footer & Accreditation', icon: ShieldCheck },
    { key: 'features', label: '⚙️ Module Visibility & Rules', icon: Sliders },
    { key: 'about', label: '\ud83d\udcda About University', icon: BookOpen },
    { key: 'custom', label: '➕ Custom Parameters', icon: PlusCircle },
  ];

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
                  showToast('⚡ Logged in as Super Admin! Sabhi edit options unlock ho gaye.');
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
                  🔐 Administrator Authentication Required / एडिट ऑप्शन्स अनलॉक करें
                </h6>
                <p className="mb-0 text-muted small">
                  Aap abhi Super Admin account se login nahi hain. Database settings, verification queue aur user permissions edit karke live save karne ke liye kripya <strong>1-Click Super Admin Login</strong> karein:
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap flex-shrink-0">
              <button
                onClick={async () => {
                  await quickDemoLogin('superadmin@akaluniversity.ac.in', 'Admin@12345');
                  showToast('⚡ Logged in as Super Admin! Sabhi edit options unlock ho gaye.');
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

          {hasPermission('verify_alumni') && (
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
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No users found. {!isAdmin && '(Admin login required to view all user accounts)'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Admin Accounts & Permissions (superadmin only) */}
        {activeTab === 'admins' && isSuperAdmin && (
          <AdminManagement showToast={showToast} />
        )}

        {/* TAB 4: MASTER SITE CUSTOMIZER & SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="row g-4">
            {/* Left Category Sub-Tabs */}
            <div className="col-lg-3">
              <div className="akal-card p-3 sticky-top" style={{ top: '80px' }}>
                <div className="fw-bold text-dark small text-uppercase mb-2 px-2" style={{ letterSpacing: '0.05em' }}>Site Customizer</div>
                <div className="d-flex flex-column gap-1">
                  {settingsCategories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.key}
                        className={`btn btn-sm text-start py-2 px-3 rounded-3 d-flex align-items-center gap-2 border-0 ${settingsGroupTab === cat.key ? 'btn-akal-primary text-white fw-bold' : 'btn-light text-dark'}`}
                        onClick={() => setSettingsGroupTab(cat.key)}
                      >
                        <IconComponent size={16} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-top d-flex flex-column gap-2">
                  <button
                    onClick={handlePreviewSite}
                    className="btn btn-akal-outline w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                    title="Dekhiye site kaisi lagegi (kuch publish kiye bina)"
                  >
                    <Eye size={16} /> Preview Site
                  </button>
                  <button onClick={handleSaveSettings} className="btn btn-akal-yellow w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm py-2">
                    <Save size={16} /> Save & Publish
                  </button>

                  {unsavedCount > 0 ? (
                    <div className="small text-center fw-bold text-warning d-flex align-items-center justify-content-center gap-1">
                      <AlertCircle size={13} /> {unsavedCount} change{unsavedCount > 1 ? 's' : ''} not saved yet
                    </div>
                  ) : (
                    <div className="small text-center text-success fw-bold d-flex align-items-center justify-content-center gap-1">
                      <CheckCircle2 size={13} /> Site is up to date
                    </div>
                  )}

                  <button onClick={handleDiscardSettings} className="btn btn-link text-muted small border-0 p-0">
                    Discard unsaved changes
                  </button>
                </div>
              </div>
            </div>

            {/* Right Settings Form Fields */}
            <div className="col-lg-9">
              <div className="akal-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      {settingsCategories.find(c => c.key === settingsGroupTab)?.label || 'Portal Details'}
                    </h5>
                    <span className="text-muted small">
                      Pehle <strong>Preview</strong> karke dekhein site kaisi lagegi — sirf <strong>Save</strong> karne par changes live honge
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
                      title="Site ka preview lein (changes publish kiye bina)"
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
                      ) : s.setting_key.includes('description') || s.setting_key.includes('address') || s.setting_key.includes('text') && s.setting_value?.length > 60 ? (
                        <textarea
                          className="form-control"
                          rows="3"
                          value={s.setting_value || ''}
                          onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                        />
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
                      <p className="mb-2 fw-semibold">Is category me abhi koi setting list nahi hui hai.</p>
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
                              showToast('⚡ Logged in as Super Admin! Sabhi edit options unlock ho gaye.');
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

      </div>
    </div>
  );
};

export default AdminDashboard;
