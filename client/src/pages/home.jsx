// pages/home.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Asesmen from "./asesmen";
import RekapitulasiAsesmen from "./rekapitulasiasesmen";
import Anggota from "./anggota";
import Gedung from "./gedung";
import Map from "./map";
import LaporanKecelakaan from "./laporankecelakaan";

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const getJakartaDateParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type) => Number(parts.find((item) => item.type === type)?.value || 0);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activePage, setActivePage] = useState("Dashboard");
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceName, setWorkspaceName] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [loadingAnggota, setLoadingAnggota] = useState(false);
  
  // state untuk list ruang kerja
  const [workspaces, setWorkspaces] = useState([]);

  // state untuk create/edit ruang kerja
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [loadingWorkspaceForm, setLoadingWorkspaceForm] = useState(false);
  const [workspaceFormData, setWorkspaceFormData] = useState({
    nama: "",
    logoFile: null,
    logo_url: "",
    removeLogo: false,
  });

  const backendURL = import.meta.env.VITE_BACKEND_URL;
  
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${backendURL}/api/user/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Gagal ambil user:", err);
      }
    };

    fetchUser();
  }, []);
  const [openProfile, setOpenProfile] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const editPhotoPreview = useMemo(
    () => (editPhoto ? URL.createObjectURL(editPhoto) : null),
    [editPhoto]
  );

  useEffect(() => {
    return () => {
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    };
  }, [editPhotoPreview]);

  // Isi editName saat modal dibuka
  useEffect(() => {
    if (showEditModal && user) {
      setEditName(user.name || "");
    }
  }, [showEditModal, user]);

  // Klik di luar untuk tutup dropdown/modal
  useEffect(() => {
  const handleClickOutside = (e) => {
    // Tutup dropdown profil jika klik di luar
    if (openProfile && !e.target.closest('.profile-dropdown') && !e.target.closest('.profile-avatar')) {
      setOpenProfile(false);
    }

    // Tutup modal edit jika klik di luar konten modal 
    // TAPI pastikan kliknya bukan berasal dari tombol "Edit Profile" itu sendiri
    if (showEditModal && !e.target.closest('.edit-modal-content') && !e.target.closest('.profile-dropdown')) {
      setShowEditModal(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside); // Gunakan mousedown agar lebih responsif
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showEditModal, openProfile]); // Tambahkan openProfile ke dependency

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);

    const formData = new FormData();
    formData.append('name', editName);
    if (editPhoto) {
      formData.append('file', editPhoto);
    }

    try {
      const res = await fetch(`${backendURL}/api/user/update-profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Refresh user data
        const userRes = await fetch(`${backendURL}/api/user/me`, {
          credentials: "include",
        });
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.user);
        }
        setShowEditModal(false);
        setEditPhoto(null);
      } else {
        alert(data.message || 'Gagal update profile');
      }
    } catch (err) {
      console.error('Error update profile:', err);
      alert('Terjadi kesalahan saat update profile');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${backendURL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.clear();
    window.location.href = "/login";
  };

  // ===== HANDLER WORKSPACE =====
  const handleResetWorkspaceForm = () => {
    setWorkspaceFormData({
      nama: "",
      logoFile: null,
      logo_url: "",
      removeLogo: false,
    });
    setEditingWorkspaceId(null);
  };

  const handleOpenCreateModal = () => {
    handleResetWorkspaceForm();
    setShowCreateWorkspaceModal(true);
  };

  const handleOpenEditModal = (workspace) => {
    setWorkspaceFormData({
      nama: workspace.nama || "",
      logoFile: null,
      logo_url: workspace.logo_url || "",
      removeLogo: false,
    });
    setEditingWorkspaceId(workspace._id);
    setShowEditWorkspaceModal(true);
  };

  const handleSaveWorkspace = async (e) => {
    e.preventDefault();
    setLoadingWorkspaceForm(true);

    try {
      const payload = new FormData();
      payload.append("nama", workspaceFormData.nama || "");
      if (workspaceFormData.logoFile) {
        payload.append("file", workspaceFormData.logoFile);
      }
      if (workspaceFormData.removeLogo) {
        payload.append("removeLogo", "true");
      }

      if (editingWorkspaceId) {
        // Update
        const res = await fetch(
          `${backendURL}/api/ruangkerja/edit-ruangkerja?ruangkerja_id=${editingWorkspaceId}`,
          {
            method: "PUT",
            credentials: "include",
            body: payload,
          }
        );
        const data = await res.json();
        if (data.success) {
          alert("Ruang kerja berhasil diupdate");
          setShowEditWorkspaceModal(false);
          // Refresh workspaces list
          const listRes = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
            credentials: "include",
          });
          const listData = await listRes.json();
          if (listData.success) {
            setWorkspaces(listData.data || []);
          }
        } else {
          alert(data.message || "Gagal update ruang kerja");
        }
      } else {
        // Create
        const res = await fetch(`${backendURL}/api/ruangkerja/buat-ruangkerja`, {
          method: "POST",
          credentials: "include",
          body: payload,
        });
        const data = await res.json();
        if (data.success) {
          alert("Ruang kerja berhasil dibuat");
          setShowCreateWorkspaceModal(false);
          handleResetWorkspaceForm();
          // Refresh workspaces list
          const listRes = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
            credentials: "include",
          });
          const listData = await listRes.json();
          if (listData.success) {
            setWorkspaces(listData.data || []);
          }
        } else {
          alert(data.message || "Gagal buat ruang kerja");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat menyimpan ruang kerja");
    } finally {
      setLoadingWorkspaceForm(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ruang kerja ini?")) return;

    try {
      const res = await fetch(`${backendURL}/api/ruangkerja/hapus-ruangkerja`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: workspaceId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Ruang kerja berhasil dihapus");
        // Refresh workspaces list
        const listRes = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
          credentials: "include",
        });
        const listData = await listRes.json();
        if (listData.success) {
          setWorkspaces(listData.data || []);
        }
      } else {
        alert(data.message || "Gagal hapus ruang kerja");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat menghapus ruang kerja");
    }
  };

  const handleLeaveWorkspace = async (targetWorkspaceId) => {
    if (!confirm("Apakah Anda yakin ingin keluar dari workspace ini?")) return;

    try {
      const res = await fetch(
        `${backendURL}/api/ruangkerja/keluar-sendiri?ruangkerja_id=${targetWorkspaceId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Gagal keluar dari workspace");
        return;
      }

      const listRes = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
        credentials: "include",
      });
      const listData = await listRes.json();
      const wsList = listData.success ? (listData.data || []) : [];
      setWorkspaces(wsList);

      if (workspaceId === targetWorkspaceId) {
        if (wsList.length > 0) {
          const nextWs = wsList[0];
          setWorkspaceId(nextWs._id);
          setWorkspaceName(nextWs.nama);
          localStorage.setItem("workspace_aktif", nextWs._id);
          localStorage.setItem("workspace_aktif_nama", nextWs.nama);
        } else {
          setWorkspaceId(null);
          setWorkspaceName(null);
          localStorage.removeItem("workspace_aktif");
          localStorage.removeItem("workspace_aktif_nama");
        }
      }

      alert("Berhasil keluar dari workspace");
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat keluar dari workspace");
    }
  };
  const nowJakarta = getJakartaDateParts(new Date());

  const [bobotRisiko, setBobotRisiko] = useState(70);
  const bobotFrekuensi = 100 - bobotRisiko;
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState(nowJakarta.month);
  const [filterYear, setFilterYear] = useState(nowJakarta.year);

  const skalaResiko = {
  Insignificant: 1,
  Minor: 2,
  Moderate: 3,
  Major: 4,
  Fatal: 5,
};

const [laporan, setLaporan] = useState([]);
const [hasilSAW, setHasilSAW] = useState([]);
const [loadingSAW, setLoadingSAW] = useState(false);
const maxNilaiSAW = hasilSAW.length > 0 ? Math.max(...hasilSAW.map((item) => item.nilaiSAW)) : 0;

const parseLaporanDate = (lap) => {
  const rawDate =
    lap.waktu_tanggal ??
    lap.tanggal ??
    lap.createdAt ??
    lap.date ??
    lap.tanggal_laporan ??
    lap.created_at;
  if (!rawDate) return null;
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const laporanWithDate = useMemo(
  () =>
    laporan.map((lap) => ({
      ...lap,
      _parsedDate: parseLaporanDate(lap),
    })),
  [laporan]
);

const filteredLaporan = useMemo(() => {
  return laporanWithDate.filter((lap) => {
    if (filterType === "all") return true;
    if (!lap._parsedDate) return false;

    const { year, month } = getJakartaDateParts(lap._parsedDate);

    if (filterType === "month") {
      return month === filterMonth && year === filterYear;
    }
    if (filterType === "year") {
      return year === filterYear;
    }
    return true;
  });
}, [laporanWithDate, filterType, filterMonth, filterYear]);

const availableYears = useMemo(() => {
  const years = new Set(
    laporanWithDate
      .map((lap) => lap._parsedDate)
      .filter(Boolean)
      .map((date) => getJakartaDateParts(date).year)
  );
  return Array.from(years).sort((a, b) => b - a);
}, [laporanWithDate]);

const dateRange = useMemo(() => {
  const dates = laporanWithDate
    .map((lap) => lap._parsedDate)
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (!dates.length) return null;
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}, [laporanWithDate]);

const formatDate = (date) =>
  date
    ? date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: JAKARTA_TIME_ZONE,
      })
    : "";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const yearOptions = availableYears.length > 0 ? availableYears : [nowJakarta.year];

const activeFilterLabel = filterType === "all"
  ? dateRange
    ? `All (${formatDate(dateRange.start)} - ${formatDate(dateRange.end)})`
    : "All"
  : filterType === "month"
  ? `${monthNames[filterMonth - 1]} ${filterYear}`
  : `${filterYear}`;

  // Ambil workspace aktif + fetch ruang kerja pertama kali
useEffect(() => {
  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
        credentials: "include",
      });
      const data = await res.json();
      const wsList = data.data || [];
      setWorkspaces(wsList);

      // Cek workspace aktif dari localStorage dulu
      const savedWsId = localStorage.getItem("workspace_aktif");
      const savedWsName = localStorage.getItem("workspace_aktif_nama");

      if (savedWsId && savedWsName) {
        setWorkspaceId(savedWsId);
        setWorkspaceName(savedWsName);
        return; // jangan overwrite pilihan user
      }

      // Kalau belum ada workspace aktif tersimpan, tentukan default
      let defaultWs = null;
      const ownerWs = wsList.filter(
        ws => ws.pengguna_id === localStorage.getItem("user_id")
      );

      if (ownerWs.length > 0) {
        defaultWs = ownerWs.reduce((prev, curr) =>
          new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
        );
      } else if (wsList.length > 0) {
        defaultWs = wsList[0];
      }

      if (defaultWs) {
        setWorkspaceId(defaultWs._id);
        setWorkspaceName(defaultWs.nama);
        localStorage.setItem("workspace_aktif", defaultWs._id);
        localStorage.setItem("workspace_aktif_nama", defaultWs.nama);
      }
    } catch (err) {
      console.error("Gagal fetch ruang kerja:", err);
    }
  };

  fetchWorkspaces();
}, []);

useEffect(() => {
  if (!workspaceId) {
    setLaporan([]);
    return;
  }

  const fetchLaporan = async () => {
    setLoadingSAW(true);
    try {
      const res = await fetch(
        `${backendURL}/api/laporankecelakaan/list?ruangkerja_id=${workspaceId}`,
        { credentials: "include" }
      );
      const json = await res.json();

      const data = Array.isArray(json.data) ? json.data : [];
      setLaporan(data);
    } catch (err) {
      console.error("Gagal fetch laporan SAW:", err);
      setLaporan([]);
    } finally {
      setLoadingSAW(false);
    }
  };

  fetchLaporan();
}, [workspaceId]);
useEffect(() => {
  if (!Array.isArray(filteredLaporan) || filteredLaporan.length === 0) {
    setHasilSAW([]);
    return;
  }

  const normalisasiRisiko = bobotRisiko / 100;
  const normalisasiFrekuensi = bobotFrekuensi / 100;

  const lokasiMap = {};

  filteredLaporan.forEach((lap) => {
    if (!lap.lokasi || !lap.tingkat_resiko) return;

    if (!lokasiMap[lap.lokasi]) {
      lokasiMap[lap.lokasi] = {
        lokasi: lap.lokasi,
        frekuensi: 0,
        totalResiko: 0,
        detailResiko: {
          Insignificant: 0,
          Minor: 0,
          Moderate: 0,
          Major: 0,
          Fatal: 0,
        },
      };
    }

    lokasiMap[lap.lokasi].frekuensi += 1;

    const nilai = skalaResiko[lap.tingkat_resiko] || 0;
    lokasiMap[lap.lokasi].totalResiko += nilai;

    if (lokasiMap[lap.lokasi].detailResiko[lap.tingkat_resiko] !== undefined) {
      lokasiMap[lap.lokasi].detailResiko[lap.tingkat_resiko] += 1;
    }
  });

  const lokasiArray = Object.values(lokasiMap);

  if (lokasiArray.length === 0) {
    setHasilSAW([]);
    return;
  }

  const maxFrekuensi = Math.max(...lokasiArray.map((l) => l.frekuensi), 1);
  const maxResiko = Math.max(...lokasiArray.map((l) => l.totalResiko), 1);

  const hasil = lokasiArray
    .map((l) => {
      const normalFrekuensi = l.frekuensi / maxFrekuensi;
      const normalResiko = l.totalResiko / maxResiko;

      return {
        ...l,
        nilaiSAW:
          normalFrekuensi * normalisasiFrekuensi +
          normalResiko * normalisasiRisiko,
      };
    })
    .sort((a, b) => b.nilaiSAW - a.nilaiSAW);

  setHasilSAW(hasil);
}, [filteredLaporan, bobotRisiko]);




  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white sticky top-0 z-10 flex justify-between items-center p-4 shadow-sm">
          <button
            className="p-2 text-2xl font-bold lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h2 className="text-2xl font-semibold">{activePage}</h2>
          <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="profile-avatar w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center font-bold text-white"
          >
            {user?.photo ? (
              <img
                src={user.photo}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </button>

          {openProfile && (
            <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">
              
              {/* USER INFO */}
              <div className="p-3 border-b">
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* EDIT PROFILE */}
              <button
                onClick={() => {
                  if (!user?.photo) return;
                  setShowPhotoModal(true);
                  setOpenProfile(false);
                }}
                disabled={!user?.photo}
                className={`w-full text-left px-4 py-2 text-sm ${
                  user?.photo
                    ? "hover:bg-gray-100"
                    : "cursor-not-allowed text-gray-400"
                }`}
              >
                Lihat Foto Profil
              </button>

              {/* EDIT PROFILE */}
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setOpenProfile(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Edit Profile
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        </header>

        <section className="p-6 space-y-4">
         {activePage === "Dashboard" && (
  <div className="space-y-4">
    {workspaceName && (
      <p className="text-sm text-gray-500">
        Workspace aktif: {workspaceName}
      </p>
    )}

    <div className="bg-white rounded-3xl shadow p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="font-semibold text-xl">Prioritas Lokasi Risiko (Metode SAW)</h4>
          <p className="text-sm text-gray-600 mt-2">
            Atur bobot risiko untuk melihat perubahan prioritas lokasi secara realtime.
          </p>
          {filterType === "all" && (
            <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Data mode All: {dateRange ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : "rentang tanggal belum tersedia"}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 w-full lg:w-[420px]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Filter Tanggal</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "month", label: "Bulan" },
                  { key: "year", label: "Tahun" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilterType(option.key)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      filterType === option.key
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {filterType === "month" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Bulan
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  Tahun
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {filterType === "year" && (
              <div>
                <label className="text-sm text-slate-600">
                  Tahun
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="text-sm text-slate-500">
              Menampilkan: <span className="font-medium text-slate-900">{activeFilterLabel}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600 mb-3">
            <span>Geser untuk menyesuaikan bobot !</span>
            <span>{bobotRisiko}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bobotRisiko}
            onChange={(e) => setBobotRisiko(Number(e.target.value))}
            className="w-full"
          />

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Risiko</span>
            <span>{bobotRisiko}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${bobotRisiko}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Frekuensi</span>
            <span>{bobotFrekuensi}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-green-600"
              style={{ width: `${bobotFrekuensi}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Prioritas Lokasi</p>
              <h5 className="text-lg font-semibold text-slate-900">Diagram Batang</h5>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
              {hasilSAW.length} lokasi dianalisis
            </span>
          </div>

          {loadingSAW ? (
            <p className="text-gray-500 text-sm">Memuat data...</p>
          ) : hasilSAW.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Belum ada data laporan kecelakaan pada workspace ini.
            </p>
          ) : (
            <div className="space-y-4">
              {hasilSAW.slice(0, 6).map((item, index) => {
                const barWidth = maxNilaiSAW ? (item.nilaiSAW / maxNilaiSAW) * 100 : 0;
                return (
                  <div key={item.lokasi} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                      <span>{index + 1}. {item.lokasi}</span>
                      <span>{item.nilaiSAW.toFixed(3)}</span>
                    </div>
                    <div className="h-4 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Ringkasan Bobot</p>
            <p className="text-sm text-slate-500">
              Ubah bobot risiko untuk melihat bagaimana seluruh skor prioritas lokasi berubah otomatis.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Risiko</p>
              <div className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${bobotRisiko}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600">Frekuensi</p>
              <div className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${bobotFrekuensi}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


          
          {/* ISI ASESMEN */}
          {activePage === "Isi Asesmen" && <Asesmen workspaceId={workspaceId} />}

          {/* REKAP ASESMEN */}
          {activePage === "Rekapitulasi Asesmen" && (
            <RekapitulasiAsesmen workspaceId={workspaceId} />
          )}
          

          {/* Gedung */}
          {activePage === "Gedung" &&  <Gedung workspaceId={workspaceId} /> }

          {activePage === "Laporan Kecelakaan" &&  <LaporanKecelakaan workspaceId={workspaceId} /> }

          {/* MAP */}
          {activePage === "Map" && <Map workspaceId={workspaceId} /> }

          {/*Anggota */}
          {activePage === "Lihat Anggota" && workspaceId && (
            <Anggota 
              workspaceId={workspaceId} 
              ownerId={workspaces.find(ws => ws._id === workspaceId)?.pengguna_id || ""}
            />
          )}




          {/* RUANG KERJA */}
          {activePage === "Ruang Kerja" && (
            <section className="rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Ruang Kerja</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Pilih workspace aktif</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Ganti workspace untuk melihat dashboard, anggota, dan laporan sesuai ruang kerja yang dipilih.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {workspaces.length} workspace
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    + Buat Baru
                  </button>
                </div>
              </div>

              {workspaces.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  <p>Belum ada ruang kerja. Silakan tambahkan workspace terlebih dahulu.</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-4 rounded-3xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Buat Workspace Pertama
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {workspaces.map((ws) => {
                    const isActive = ws._id === workspaceId;
                    const currentUserId = user?.id || localStorage.getItem("user_id");
                    const isOwner = String(ws.pengguna_id) === String(currentUserId);
                    return (
                      <div
                        key={ws._id}
                        className={`group rounded-[28px] border p-5 transition ${isActive ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                              {ws.logo_url ? (
                                <img
                                  src={ws.logo_url}
                                  alt={`Logo ${ws.nama}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (ws.nama || "W").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Workspace</p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-900">{ws.nama}</h4>
                            </div>
                          </div>
                          {isActive && (
                            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                              Aktif
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem("workspace_aktif", ws._id);
                              localStorage.setItem("workspace_aktif_nama", ws.nama);
                              setWorkspaceId(ws._id);
                              setWorkspaceName(ws.nama);
                              setActivePage("Dashboard");
                            }}
                            className="flex-1 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            Pilih
                          </button>
                          {isOwner ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(ws)}
                                className="flex-1 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWorkspace(ws._id)}
                                className="flex-1 rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                              >
                                Hapus
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleLeaveWorkspace(ws._id)}
                              className="flex-1 rounded-2xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
                            >
                              Keluar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </section>
      </main>

      {/* VIEW PROFILE PHOTO MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/75 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Foto Profil</h3>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            {user?.photo ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={user.photo}
                  alt="Foto profil"
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Foto profil belum tersedia.
              </p>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="edit-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-100/75 px-4 py-8 backdrop-blur-sm">
          <div className="edit-modal-content w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Edit Profile</h3>
            <form onSubmit={handleEditProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Foto Profil</label>
                <input
                  id="edit-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPhoto(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <label
                  htmlFor="edit-photo-input"
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow-sm transition group-hover:bg-emerald-700">
                    +
                  </span>
                  <span className="text-sm text-slate-700">
                    {editPhoto ? editPhoto.name : "Pilih foto baru"}
                  </span>
                </label>

                {(editPhoto || user?.photo) && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={editPhotoPreview || user.photo}
                      alt="Preview foto profil"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <p className="text-xs text-slate-600">
                      {editPhoto ? "Preview foto baru" : "Foto profil saat ini"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingEdit ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WORKSPACE MODAL */}
      {showCreateWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Buat Ruang Kerja Baru</h3>
            <form onSubmit={handleSaveWorkspace}>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Ruang Kerja *</label>
                <input
                  type="text"
                  value={workspaceFormData.nama}
                  onChange={(e) => setWorkspaceFormData({...workspaceFormData, nama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Logo Ruang Kerja</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, logoFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateWorkspaceModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingWorkspaceForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingWorkspaceForm ? 'Membuat...' : 'Buat Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORKSPACE MODAL */}
      {showEditWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Ruang Kerja</h3>
            <form onSubmit={handleSaveWorkspace}>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Ruang Kerja *</label>
                <input
                  type="text"
                  value={workspaceFormData.nama}
                  onChange={(e) => setWorkspaceFormData({...workspaceFormData, nama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Logo Ruang Kerja</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, logoFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {workspaceFormData.logo_url && (
                <div className="mt-3 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-2">Logo saat ini</p>
                  <img
                    src={workspaceFormData.logo_url}
                    alt="Logo workspace"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={workspaceFormData.removeLogo}
                      onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, removeLogo: e.target.checked })}
                    />
                    Hapus logo saat ini
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditWorkspaceModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingWorkspaceForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingWorkspaceForm ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
