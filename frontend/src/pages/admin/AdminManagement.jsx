import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, PlusCircle, Search, Lock, UserPlus, KeyRound } from 'lucide-react';
const PERM_FALLBACK = {
  verify_alumni: 'Verify alumni accounts (approve / reject)',
  manage_alumni: 'Manage alumni accounts (view, activate / deactivate)',
  manage_students: 'Manage student accounts (view, activate / deactivate)',
  manage_users: 'Manage all user accounts & roles',
  manage_events: 'Manage events',
  manage_jobs: 'Manage jobs board',
  manage_stories: 'Manage stories',
  manage_news: 'Manage news',
  manage_chapters: 'Manage chapters',
  manage_gallery: 'Manage gallery',
  manage_settings: 'Edit settings',
  view_reports: 'View reports',
  view_audit_logs: 'View audit logs',
};
const emptyForm = { email: '', password: '', full_name: '', designation: 'Alumni Admin', department: '', phone: '', permissions: {} };
const AdminManagement = ({ showToast }) => {
  const [admins, setAdmins] = useState([]);
  const [catalogue, setCatalogue] = useState(PERM_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [draftPerms, setDraftPerms] = useState({});
  const notify = (m) => { if (showToast) showToast(m); };
  const fetchAll = async () => {
    setLoading(true);
    try {
      const aRes = await api.get('/admin/admins');
      let cat = PERM_FALLBACK;
      try { const cRes = await api.get('/admin/admin-permissions'); if (cRes && cRes.status && cRes.data) cat = cRes.data; } catch (e) {}
      if (aRes && aRes.status) {
        setAdmins(aRes.data || []);
        const d = {};
        (aRes.data || []).forEach((a) => { d[a.id] = a.permissions || {}; });
        setDraftPerms(d);
      }
      setCatalogue(cat);
    } catch (e) { notify(e.message || 'Failed to load admins'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const toggleDraft = (id, perm) => {
    setDraftPerms((p) => {
      const c = { ...(p[id] || {}) };
      if (c[perm]) delete c[perm]; else c[perm] = true;
      delete c['all']; delete c['manage_admins'];
      return { ...p, [id]: c };
    });
  };
  const toggleFormPerm = (perm) => {
    setForm((f) => {
      const c = { ...(f.permissions || {}) };
      if (c[perm]) delete c[perm]; else c[perm] = true;
      return { ...f, permissions: c };
    });
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/admins', form);
      if (res.status) { notify('Admin account created'); setForm(emptyForm); setShowForm(false); fetchAll(); }
    } catch (e) { notify(e.message || 'Failed to create admin'); }
  };
  const handleSave = async (a) => {
    setSavingId(a.id);
    try {
      const perms = draftPerms[a.id] || {};
      const res = await api.put('/admin/admins/' + a.id + '/permissions', { permissions: perms });
      if (res.status) { notify('Permissions updated for ' + a.email); fetchAll(); }
    } catch (e) { notify(e.message || 'Failed to save'); }
    finally { setSavingId(null); }
  };
  const handleRemove = async (a, hard) => {
    const msg = hard ? ('Delete ' + a.email + '?') : ('Remove ' + a.email + '?');
    if (!window.confirm(msg)) return;
    try {
      const res = await api.delete('/admin/admins/' + a.id + (hard ? '?hard=1' : ''));
      if (res.status) { notify(hard ? 'Admin deleted' : 'Admin removed'); fetchAll(); }
    } catch (e) { notify(e.message || 'Failed'); }
  };
  const filtered = admins.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.email || '').toLowerCase().includes(s) || (a.full_name || '').toLowerCase().includes(s);
  });
  const permKeys = Object.keys(catalogue).filter((k) => k !== 'manage_admins' && k !== 'all');
  if (loading) return (<div className="text-center py-5 text-muted"><div className="spinner-border text-primary" /></div>);
  return (
    <div className="akal-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2"><ShieldCheck size={20} className="text-danger" /> Admins</h5>
          <div className="text-muted small mt-1"><Lock size={12} className="me-1" />Super Admin only</div>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: '200px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input className="form-control" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-sm btn-danger fw-bold d-flex align-items-center gap-1" onClick={() => setShowForm(!showForm)}><UserPlus size={14} /> {showForm ? 'Close' : 'Add Admin'}</button>
        </div>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="border rounded-3 p-3 mb-4 mt-3 bg-light">
          <h6 className="fw-bold mb-3"><PlusCircle size={16} className="me-1" />New Admin</h6>
          <div className="row g-2">
            <div className="col-md-4"><label className="form-label small fw-bold">Full Name *</label><input className="form-control form-control-sm" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
            <div className="col-md-4"><label className="form-label small fw-bold">Email *</label><input type="email" className="form-control form-control-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="col-md-4"><label className="form-label small fw-bold">Password *</label><input type="text" className="form-control form-control-sm" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} /></div>
          </div>
          <div className="row g-2">
            <div className="col-md-4"><label className="form-label small fw-bold">Designation</label><input className="form-control form-control-sm" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label small fw-bold">Department</label><input className="form-control form-control-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label small fw-bold">Phone</label><input className="form-control form-control-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="mt-3">
            <div className="small fw-bold mb-2"><KeyRound size={13} className="me-1" />Permissions:</div>
            <div className="d-flex flex-wrap gap-2">
              {permKeys.map((perm) => (
                <label key={perm} className={'badge rounded-pill px-3 py-2 border ' + (form.permissions[perm] ? 'bg-success text-white border-success' : 'bg-white text-dark')} style={{ cursor: 'pointer' }} title={catalogue[perm]}>
                  <input type="checkbox" className="form-check-input me-1" checked={!!form.permissions[perm]} onChange={() => toggleFormPerm(perm)} />{perm.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-danger fw-bold">Create Admin</button>
            <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="table-responsive mt-2">
        <table className="table table-hover align-middle small">
          <thead className="table-light"><tr><th>Admin</th><th>Role</th><th>Permissions</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {filtered.map((a) => {
              const isSuper = a.role === 'superadmin';
              const draft = draftPerms[a.id] || {};
              const dirty = JSON.stringify(draft) !== JSON.stringify(a.permissions || {});
              return (
                <tr key={a.id}>
                  <td><div className="fw-bold text-dark">{a.full_name || a.email}</div><div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{a.email}</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>{a.designation || ''}</div></td>
                  <td><span className={'badge ' + (isSuper ? 'bg-danger' : 'bg-primary')}>{String(a.role).toUpperCase()}</span><div className="mt-1"><span className={'badge ' + (a.status === 'active' ? 'bg-success' : 'bg-secondary')}>{a.status}</span></div></td>
                  <td>
                    {isSuper ? (<span className="badge bg-danger-subtle text-danger border px-3 py-2">FULL ACCESS</span>) : (
                      <React.Fragment>
                        <div className="d-flex flex-wrap gap-1">
                          {permKeys.map((perm) => (
                            <label key={perm} className={'badge rounded-pill px-2 py-1 border ' + (draft[perm] ? 'bg-success text-white border-success' : 'bg-white text-muted')} style={{ cursor: 'pointer', fontSize: '0.7rem' }} title={catalogue[perm]}>
                              <input type="checkbox" className="form-check-input me-1" checked={!!draft[perm]} onChange={() => toggleDraft(a.id, perm)} style={{ fontSize: '0.65rem' }} />{perm.replace(/_/g, ' ')}
                            </label>
                          ))}
                        </div>
                        {dirty && (<button className="btn btn-sm btn-success fw-bold mt-2" disabled={savingId === a.id} onClick={() => handleSave(a)}>{savingId === a.id ? 'Saving...' : 'Save'}</button>)}
                      </React.Fragment>
                    )}
                  </td>
                  <td className="text-end">{isSuper ? (<span className="text-muted small">Protected</span>) : (<div className="d-flex gap-1 justify-content-end"><button className="btn btn-sm btn-outline-warning" onClick={() => handleRemove(a, false)}>Remove</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(a, true)}>Delete</button></div>)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-muted">No admins found.</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="alert alert-info small mb-0 mt-2">Tick permissions then Save. Remove demotes to alumni; Delete deletes.</div>
    </div>
  );
};
export default AdminManagement;
