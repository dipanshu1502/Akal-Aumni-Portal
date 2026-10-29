import React, { useEffect, useState } from 'react';
import { AlertCircle, Cake, CheckCircle2, ChevronLeft, ChevronRight, Eye, Mail, RefreshCw, Save, Send } from 'lucide-react';
import api from '../../services/api';
import './BirthdayEmailManagement.css';

const EMPTY_TEMPLATE = {
  subject: '',
  message_body: '',
  is_enabled: false,
};

const BirthdayEmailManagement = () => {
  const [template, setTemplate] = useState(EMPTY_TEMPLATE);
  const [statistics, setStatistics] = useState({ sent: 0, failed: 0 });
  const [testRecipient, setTestRecipient] = useState('');
  const [lastRunAt, setLastRunAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/birthday-emails');
        if (!active) return;
        setTemplate(response.data.settings);
        setStatistics(response.data.statistics);
        setTestRecipient(response.data.test_recipient || '');
        setLastRunAt(response.data.settings.last_run_at);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Could not load birthday email settings.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSettings();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      const query = new URLSearchParams({
        page: String(page),
        per_page: '20',
        status: statusFilter,
        search,
      });
      try {
        const response = await api.get(`/admin/birthday-emails/history?${query.toString()}`);
        if (!active) return;
        setHistory(response.data.items);
        setHistoryMeta(response.data.pagination);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Could not load birthday email history.');
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => { active = false; };
  }, [historyRefreshKey, page, search, statusFilter]);

  const updateTemplate = (key, value) => {
    setTemplate((current) => ({ ...current, [key]: value }));
    setNotice('');
  };

  const saveTemplate = async (event) => {
    event.preventDefault();
    setBusy('save');
    setError('');
    setNotice('');
    try {
      await api.put('/admin/birthday-emails', template);
      setNotice('Birthday email settings saved.');
    } catch (requestError) {
      setError(requestError.message || 'Could not save birthday email settings.');
    } finally {
      setBusy('');
    }
  };

  const previewTemplate = async () => {
    setBusy('preview');
    setError('');
    setNotice('');
    try {
      const response = await api.post('/admin/birthday-emails/preview', template);
      setPreviewHtml(response.data.html);
    } catch (requestError) {
      setError(requestError.message || 'Could not generate the email preview.');
    } finally {
      setBusy('');
    }
  };

  const sendTest = async () => {
    setBusy('test');
    setError('');
    setNotice('');
    try {
      const response = await api.post('/admin/birthday-emails/test', template);
      setNotice(`Test email sent to ${response.data.recipient}.`);
    } catch (requestError) {
      setError(requestError.message || 'Could not send the test email.');
    } finally {
      setBusy('');
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setHistoryLoading(true);
    setPage(1);
    const nextSearch = searchText.trim();
    if (page === 1 && search === nextSearch) {
      setHistoryRefreshKey((current) => current + 1);
    } else {
      setSearch(nextSearch);
    }
  };

  if (loading) {
    return <div className="birthday-loading"><RefreshCw size={18} className="birthday-spin" /> Loading birthday email settings…</div>;
  }

  return (
    <section className="birthday-email-page">
      <header className="birthday-page-heading">
        <div className="birthday-heading-icon"><Cake size={24} /></div>
        <div>
          <div className="birthday-eyebrow">Alumni communications</div>
          <h2>Birthday emails</h2>
          <p>Celebrate Akal alumni automatically with a personal message from the Alumni Association.</p>
        </div>
      </header>

      {error && <div className="birthday-alert birthday-alert-error" role="alert"><AlertCircle size={18} /> {error}</div>}
      {notice && <div className="birthday-alert birthday-alert-success" role="status"><CheckCircle2 size={18} /> {notice}</div>}

      <div className="birthday-stat-grid">
        <article className="birthday-stat-card">
          <span>Successfully sent</span>
          <strong>{statistics.sent}</strong>
          <small>Birthday messages delivered</small>
        </article>
        <article className="birthday-stat-card">
          <span>Delivery failures</span>
          <strong>{statistics.failed}</strong>
          <small>Attempts needing attention</small>
        </article>
        <article className="birthday-stat-card birthday-stat-run">
          <span>Last execution</span>
          <strong>{lastRunAt || 'Not run yet'}</strong>
          <small>Updated by the daily CLI scheduler</small>
        </article>
      </div>

      <form className="birthday-panel birthday-editor" onSubmit={saveTemplate}>
        <div className="birthday-panel-heading">
          <div>
            <h3><Mail size={18} /> Message settings</h3>
            <p>Use a plain-text message. It is safely rendered in a branded HTML email.</p>
          </div>
          <label className="birthday-toggle">
            <input
              type="checkbox"
              checked={!!template.is_enabled}
              onChange={(event) => updateTemplate('is_enabled', event.target.checked)}
            />
            <span className="birthday-toggle-track" aria-hidden="true" />
            <span>{template.is_enabled ? 'Automation enabled' : 'Automation disabled'}</span>
          </label>
        </div>

        <label className="birthday-field">
          <span>Email subject</span>
          <input
            type="text"
            maxLength="255"
            value={template.subject}
            onChange={(event) => updateTemplate('subject', event.target.value)}
            placeholder="Happy Birthday, {{name}}!"
            required
          />
        </label>

        <label className="birthday-field">
          <span>Email message</span>
          <textarea
            rows="9"
            maxLength="10000"
            value={template.message_body}
            onChange={(event) => updateTemplate('message_body', event.target.value)}
            placeholder={'Dear {{name}},\n\nWishing you a wonderful birthday…'}
            required
          />
        </label>
        <div className="birthday-placeholder-help">
          Personalization: <code>{'{{name}}'}</code> and <code>{'{{university_name}}'}</code>
        </div>

        <div className="birthday-editor-actions">
          <button type="button" className="btn btn-outline-secondary" onClick={previewTemplate} disabled={!!busy}>
            <Eye size={16} /> {busy === 'preview' ? 'Preparing…' : 'Preview email'}
          </button>
          <button type="button" className="btn btn-outline-primary" onClick={sendTest} disabled={!!busy || !testRecipient}>
            <Send size={16} /> {busy === 'test' ? 'Sending…' : 'Send test email'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={!!busy}>
            <Save size={16} /> {busy === 'save' ? 'Saving…' : 'Save settings'}
          </button>
        </div>
        <p className="birthday-recipient-note">
          Test messages go only to {testRecipient || 'the configured test address'}. One test is allowed per minute.
        </p>
      </form>

      {previewHtml && (
        <section className="birthday-panel birthday-preview-panel">
          <div className="birthday-panel-heading">
            <div><h3>Email preview</h3><p>Personalized sample; the live message uses each alumnus’s name.</p></div>
            <button type="button" className="btn btn-sm btn-light border" onClick={() => setPreviewHtml('')}>Close</button>
          </div>
          <iframe
            title="Birthday email preview"
            className="birthday-preview-frame"
            sandbox=""
            srcDoc={previewHtml}
          />
        </section>
      )}

      <section className="birthday-panel birthday-history-panel">
        <div className="birthday-panel-heading">
          <div><h3>Delivery history</h3><p>Successful and failed alumni delivery attempts.</p></div>
          <button type="button" className="btn btn-sm btn-light border" onClick={() => { setHistoryLoading(true); setHistoryRefreshKey((current) => current + 1); }} disabled={historyLoading}>
            <RefreshCw size={15} className={historyLoading ? 'birthday-spin' : ''} /> Refresh
          </button>
        </div>

        <form className="birthday-history-filters" onSubmit={submitSearch}>
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search alumni, email, or subject"
            aria-label="Search delivery history"
          />
          <select
            value={statusFilter}
            onChange={(event) => { setHistoryLoading(true); setPage(1); setStatusFilter(event.target.value); }}
            aria-label="Filter by delivery status"
          >
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <button type="submit" className="btn btn-outline-primary">Search</button>
        </form>

        <div className="table-responsive">
          <table className="table align-middle birthday-history-table">
            <thead>
              <tr><th>Alumni</th><th>Birthday year</th><th>Subject</th><th>Status</th><th>Sent / attempted</th></tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan="5" className="birthday-empty"><RefreshCw size={17} className="birthday-spin" /> Loading history…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="birthday-empty">No birthday email records found.</td></tr>
              ) : history.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.alumni_name?.trim() || 'Alumni account unavailable'}</strong>
                    <small>{entry.recipient_email}</small>
                    {entry.status === 'failed' && entry.error_message && <small className="birthday-error-detail">{entry.error_message}</small>}
                  </td>
                  <td>{entry.birthday_year}</td>
                  <td>{entry.email_subject}</td>
                  <td><span className={`birthday-status birthday-status-${entry.status}`}>{entry.status}</span></td>
                  <td>{entry.sent_at || entry.created_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="birthday-pagination">
          <span>{historyMeta.total} record{historyMeta.total === 1 ? '' : 's'}</span>
          <div>
            <button type="button" className="btn btn-sm btn-light border" onClick={() => { setHistoryLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page <= 1 || historyLoading} aria-label="Previous page">
              <ChevronLeft size={17} />
            </button>
            <span>Page {historyMeta.total_pages === 0 ? 0 : page} of {historyMeta.total_pages}</span>
            <button type="button" className="btn btn-sm btn-light border" onClick={() => { setHistoryLoading(true); setPage((current) => Math.min(historyMeta.total_pages, current + 1)); }} disabled={page >= historyMeta.total_pages || historyLoading} aria-label="Next page">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default BirthdayEmailManagement;
