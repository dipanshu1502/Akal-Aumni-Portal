import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

const DRAFT_KEY = 'akal_settings_draft';
const PREVIEW_FLAG = 'akal_preview_mode';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // drafts older than 24h are ignored

/**
 * Preview mode is per-tab (sessionStorage) so normal visitors / other tabs
 * always see the live site. Only a tab opened with ?preview=1 is a preview.
 */
const detectPreview = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') {
      sessionStorage.setItem(PREVIEW_FLAG, '1');
      return true;
    }
    return sessionStorage.getItem(PREVIEW_FLAG) === '1';
  } catch {
    return false;
  }
};

/** Draft written by the admin dashboard before hitting "Preview Site" */
const readDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.settings) return {};
    if (!parsed.savedAt || Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) return {};
    return parsed.settings;
  } catch {
    return {};
  }
};

const clearDraftStorage = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({}); // live (published) values
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(() => detectPreview());
  const [draft, setDraft] = useState(() => (detectPreview() ? readDraft() : {}));

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/public/settings');
      if (res.status && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load portal settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Live update the preview when the admin dashboard writes a new draft
  useEffect(() => {
    if (!isPreview) return undefined;
    const onStorage = (event) => {
      if (event.key === DRAFT_KEY || event.key === null) {
        setDraft(readDraft());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isPreview]);

  // In preview mode the unsaved draft overrides the published settings
  const effectiveSettings = isPreview ? { ...settings, ...draft } : settings;

  const previewChanges = isPreview
    ? Object.keys(draft).filter((key) => String(draft[key]) !== String(settings[key] ?? '')).length
    : 0;

  const getSetting = (key, fallback = '') => {
    return effectiveSettings[key] !== undefined && effectiveSettings[key] !== null && effectiveSettings[key] !== ''
      ? effectiveSettings[key]
      : fallback;
  };

  const isFeatureEnabled = (key, defaultVal = true) => {
    if (effectiveSettings[key] === undefined) return defaultVal;
    return effectiveSettings[key] === '1' || effectiveSettings[key] === 1 || effectiveSettings[key] === true || effectiveSettings[key] === 'true';
  };

  /** Publish the previewed draft to the live site (admin only) */
  const publishDraft = async () => {
    try {
      const payload = { ...settings, ...draft };
      const res = await api.post('/admin/settings', payload);
      if (res.status) {
        clearDraftStorage();
        setDraft({});
        setIsPreview(false);
        await fetchSettings();
        return { success: true, message: 'Changes published — now live on the site!' };
      }
      return { success: false, message: res.message || 'Publish failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Publish failed' };
    }
  };

  /** Leave preview and go back to the live site (discards the previewed draft) */
  const exitPreview = () => {
    clearDraftStorage();
    setDraft({});
    setIsPreview(false);
    try {
      sessionStorage.removeItem(PREVIEW_FLAG);
      const url = new URL(window.location.href);
      url.searchParams.delete('preview');
      window.history.replaceState({}, '', url.toString());
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: effectiveSettings,
        liveSettings: settings,
        getSetting,
        isFeatureEnabled,
        refreshSettings: fetchSettings,
        loading,
        isPreview,
        previewChanges,
        publishDraft,
        exitPreview,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
