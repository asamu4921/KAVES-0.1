import type { Project } from '$lib/models/types';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5454';

// 🔥 Helper untuk ambil ruangkerja_id dari URL query parameter atau session storage
function getRuangKerjaId(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const ruangKerjaId = urlParams.get('ruangkerja_id');

  if (ruangKerjaId) {
    sessionStorage.setItem('ruangkerja_id', ruangKerjaId);
    return ruangKerjaId;
  }

  return sessionStorage.getItem('ruangkerja_id');
}

// 🔥 Helper fetch untuk iframe integration
function authFetch(url: string, options: RequestInit = {}) {
  // 🔥 Tambahkan ruangkerja_id ke URL jika tersedia
  const ruangKerjaId = getRuangKerjaId();
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = ruangKerjaId ? `${url}${separator}ruangkerja_id=${ruangKerjaId}` : url;

  return fetch(finalUrl, {
    ...options,
    credentials: 'include', // 🔥 Gunakan cookie dari React app utama
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

export interface DataStore {
  save(project: Project): Promise<void>;
  load(id: string): Promise<Project | null>;
  list(): Promise<{ id: string; name: string; updatedAt: string }[]>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Project | null>;
  saveThumbnail(id: string, dataUrl: string): Promise<void>;
  getThumbnail(id: string): Promise<string | null>;
}

export const localStore: DataStore = {

  // ✅ SAVE
  async save(project) {
    try {
      const response = await authFetch(`${API_BASE}/api/projects/save`, {
        method: 'POST',
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[DataStore] Save error:', error);
      throw error;
    }
  },

  // ✅ LOAD
  async load(id) {
    try {
      const response = await authFetch(`${API_BASE}/api/projects/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Load failed: ${response.statusText}`);
      }

      const p = await response.json();

      // 🔥 optional safety
      if (!p) return null;

      p.createdAt = new Date(p.createdAt);
      p.updatedAt = new Date(p.updatedAt);

      for (const floor of (p.floors ?? [])) {
        if (!floor.rooms) floor.rooms = [];
        if (!floor.doors) floor.doors = [];
        if (!floor.windows) floor.windows = [];
        if (!floor.furniture) floor.furniture = [];
        if (!floor.stairs) floor.stairs = [];
        if (!floor.columns) floor.columns = [];
      }

      return p as Project;
    } catch (error) {
      console.error('[DataStore] Load error:', error);
      throw error;
    }
  },

  // ✅ LIST
  async list() {
    try {
      const response = await authFetch(`${API_BASE}/api/projects`);

      const data = await response.json();

      console.log("LIST RESPONSE:", data);

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`);
      }

      // 🔥 biar gak crash
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error('[DataStore] List error:', error);
      return [];
    }
  },

  // ✅ DELETE
  async delete(id) {
    try {
      const response = await authFetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[DataStore] Delete error:', error);
      throw error;
    }
  },

  // ✅ DUPLICATE
  async duplicate(id: string): Promise<Project | null> {
    try {
      const original = await this.load(id);
      if (!original) return null;

      const newId = Math.random().toString(36).slice(2, 10);

      const dup: Project = {
        ...original,
        id: newId,
        name: `${original.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.save(dup);

      const thumb = await this.getThumbnail(id);
      if (thumb) await this.saveThumbnail(newId, thumb);

      return dup;

    } catch (error) {
      console.error('[DataStore] Duplicate error:', error);
      throw error;
    }
  },

  // ✅ SAVE THUMBNAIL
  async saveThumbnail(id: string, dataUrl: string) {
    try {
      const response = await authFetch(`${API_BASE}/api/projects/thumbnail/${id}`, {
        method: 'POST',
        body: JSON.stringify({ dataUrl }),
      });

      if (!response.ok) {
        throw new Error(`Save thumbnail failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[DataStore] Save thumbnail error:', error);
      throw error;
    }
  },

  // ✅ GET THUMBNAIL
  async getThumbnail(id: string): Promise<string | null> {
    try {
      const response = await authFetch(`${API_BASE}/api/projects/thumbnail/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Get thumbnail failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.dataUrl || null;

    } catch (error) {
      console.error('[DataStore] Get thumbnail error:', error);
      return null;
    }
  },
};