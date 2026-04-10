// pages/home.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Asesmen from "./asesmen";
import RekapitulasiAsesmen from "./rekapitulasiasesmen";
import Anggota from "./anggota";
import Gedung from "./gedung";
import Map from "./map";
import LaporanKecelakaan from "./laporankecelakaan";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activePage, setActivePage] = useState("Dashboard");
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceName, setWorkspaceName] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [loadingAnggota, setLoadingAnggota] = useState(false);
  
  // state untuk list ruang kerja
  const [workspaces, setWorkspaces] = useState([]);

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

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



  const [bobotRisiko, setBobotRisiko] = useState(70);
  const bobotFrekuensi = 100 - bobotRisiko;
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

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
  const rawDate = lap.tanggal ?? lap.createdAt ?? lap.date ?? lap.tanggal_laporan ?? lap.created_at;
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

    const year = lap._parsedDate.getFullYear();
    const month = lap._parsedDate.getMonth() + 1;

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
      .map((date) => date.getFullYear())
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

const yearOptions = availableYears.length > 0 ? availableYears : [new Date().getFullYear()];

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
            <span>Risiko</span>
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
            <span>Sesuaikan Botot Mandiri !</span>
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
                <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {workspaces.length} workspace
                </div>
              </div>

              {workspaces.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Belum ada ruang kerja. Silakan tambahkan workspace terlebih dahulu.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {workspaces.map((ws) => {
                    const isActive = ws._id === workspaceId;
                    return (
                      <button
                        key={ws._id}
                        type="button"
                        onClick={() => {
                          localStorage.setItem("workspace_aktif", ws._id);
                          localStorage.setItem("workspace_aktif_nama", ws.nama);

                          setWorkspaceId(ws._id);
                          setWorkspaceName(ws.nama);
                          setActivePage("Dashboard");

                          alert(`Berhasil mengubah workspace ke: ${ws.nama}`);
                        }}
                        className={`group rounded-[28px] border p-5 text-left transition ${isActive ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Workspace</p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-900">{ws.nama}</h4>
                          </div>
                          {isActive && (
                            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </section>
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="edit-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="edit-modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
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
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPhoto(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
    </div>
  );
}
