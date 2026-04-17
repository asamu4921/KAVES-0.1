import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, MoreVertical, X } from "lucide-react";

export default function LaporanKecelakaan({ workspaceId }) {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const workspaceName = localStorage.getItem("workspace_aktif_nama") || "";

  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bangunanList, setBangunanList] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
  deskripsi_kejadian: "",
  lokasi: "",
  penyebab: "",
  tingkat_resiko: "",
  jenis_cedera: "",
  pertolongan_pertama: "",
  nama_petugas: "",
  pencegahan_ke_depan: "",
});
const opsiResiko = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Fatal",
];

const [foto, setFoto] = useState(null);
const [photoMode, setPhotoMode] = useState("camera");
const [showDetail, setShowDetail] = useState(false); // ⬅️ toggle detail tambahan
const [actionMenuId, setActionMenuId] = useState(null);
const [selectedImage, setSelectedImage] = useState(null);


  const [confirmDelete, setConfirmDelete] = useState({ show: false, laporanId: null });
  const [popup, setPopup] = useState({ show: false, message: "", success: true });

  /* ================= FETCH ================= */
  const fetchLaporan = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${backendURL}/api/laporankecelakaan/list?ruangkerja_id=${workspaceId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) setLaporanList(data.data || []);
      else setLaporanList([]);
    } catch {
      setLaporanList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBangunan = async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`${backendURL}/api/bangunan/list?ruangkerja_id=${workspaceId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setBangunanList(data.data || []);
    } catch {
      console.log("Gagal mengambil data bangunan");
    }
  };

  useEffect(() => {
    fetchLaporan();
    fetchBangunan();
  }, [workspaceId]);

  /* ================= SIMPAN ================= */
  const simpanLaporan = async () => {
    if (!form.deskripsi_kejadian.trim()) {
      setPopup({ show: true, message: "Deskripsi kejadian wajib diisi", success: false });
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (foto) fd.append("foto", foto);

    try {
      const url = editId
        ? `${backendURL}/api/laporankecelakaan/edit?laporan_id=${editId}`
        : `${backendURL}/api/laporankecelakaan/tambah?ruangkerja_id=${workspaceId}`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setPopup({
          show: true,
          message: editId ? "Laporan berhasil diperbarui!" : "Laporan berhasil ditambahkan!",
          success: true,
        });
        setModalOpen(false);
        setEditId(null);
        setForm({ lokasi: "", deskripsi_kejadian: "", penyebab: "", tingkat_resiko: "" });
        setFoto(null);
        setPhotoMode("camera");
        fetchLaporan();
      } else {
        setPopup({ show: true, message: data.message || "Gagal menyimpan laporan", success: false });
      }
    } catch {
      setPopup({ show: true, message: "Kesalahan server saat menyimpan laporan", success: false });
    }
  };

  /* ================= HAPUS ================= */
  const hapusLaporan = async () => {
    try {
      const res = await fetch(
        `${backendURL}/api/laporankecelakaan/hapus?laporan_id=${confirmDelete.laporanId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setPopup({ show: true, message: "Laporan berhasil dihapus!", success: true });
        fetchLaporan();
      } else {
        setPopup({ show: true, message: data.message || "Gagal menghapus laporan", success: false });
      }
    } catch {
      setPopup({ show: true, message: "Kesalahan server saat menghapus laporan", success: false });
    } finally {
      setConfirmDelete({ show: false, laporanId: null });
    }
  };

  const openEditModal = (item) => {
    setForm({
      lokasi: item.lokasi || "",
      deskripsi_kejadian: item.deskripsi_kejadian || "",
      penyebab: item.penyebab || "",
      tingkat_resiko: item.tingkat_resiko || "",
    });
    setEditId(item._id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5 relative">
      <h3 className="text-2xl font-bold">
        Laporan Kecelakaan: <span className="text-green-600">{workspaceName}</span>
      </h3>

      {/* Kartu Tambah */}
      <div className="bg-white shadow rounded-3xl w-[280px] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-6">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-white/80 uppercase">
            Laporan Kecelakaan
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">{workspaceName}</h2>
        </div>

        <div className="p-5">
          <button
            onClick={() => {
              setModalOpen(true);
              setEditId(null);
              setForm({ lokasi: "", deskripsi_kejadian: "", penyebab: "", tingkat_resiko: "" });
              setFoto(null);
              setPhotoMode("camera");
            }}
            className="w-full bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Laporan
          </button>
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white p-4 shadow rounded-3xl">
        <h4 className="text-lg font-semibold mb-3">List Laporan</h4>

        {loading ? (
          <p>Memuat...</p>
        ) : laporanList.length === 0 ? (
          <p className="text-gray-600">Belum ada laporan.</p>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-4 lg:hidden">
              {laporanList.map((item, i) => (
                <div key={item._id} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="relative h-48 bg-slate-200">
                    {item.foto ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(item.foto)}
                        className="absolute inset-0 w-full h-full overflow-hidden"
                      >
                        <img
                          src={item.foto}
                          alt="foto kejadian"
                          className="w-full h-full object-cover transition duration-300 hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                        Tidak ada foto
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setActionMenuId(actionMenuId === item._id ? null : item._id)}
                      className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm hover:bg-white"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {actionMenuId === item._id && (
                      <div className="absolute top-16 right-3 z-20 w-40 rounded-3xl border border-slate-200 bg-white shadow-lg">
                        <button
                          onClick={() => {
                            openEditModal(item);
                            setActionMenuId(null);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete({ show: true, laporanId: item._id });
                            setActionMenuId(null);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-600 font-semibold">
                          {item.lokasi || "Lokasi tidak diketahui"}
                        </p>
                        <h5 className="mt-2 text-base font-semibold text-slate-900">
                          {item.deskripsi_kejadian || "-"}
                        </h5>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.tingkat_resiko || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="font-semibold">Cedera</p>
                        <p className="mt-1 text-slate-500">{item.jenis_cedera || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="font-semibold">P3K</p>
                        <p className="mt-1 text-slate-500">{item.pertolongan_pertama || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="font-semibold">Petugas</p>
                        <p className="mt-1 text-slate-500">{item.nama_petugas || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="font-semibold">Pencegahan</p>
                        <p className="mt-1 text-slate-500">{item.pencegahan_ke_depan || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.15em] text-[12px]">
                  <tr>
                    <th className="px-3 py-3 text-left">No</th>
                    <th className="px-3 py-3 text-left">Foto</th>
                    <th className="px-3 py-3 text-left">Deskripsi</th>
                    <th className="px-3 py-3 text-left">Lokasi</th>
                    <th className="px-3 py-3 text-left">Cedera</th>
                    <th className="px-3 py-3 text-left">P3K</th>
                    <th className="px-3 py-3 text-left">Petugas</th>
                    <th className="px-3 py-3 text-left">Resiko</th>
                    <th className="px-3 py-3 text-left">Pencegahan</th>
                    <th className="px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {laporanList.map((item, i) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-3 py-4 align-top">{i + 1}</td>
                      <td className="px-3 py-4 align-top">
                        {item.foto ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(item.foto)}
                            className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                          >
                            <img
                              src={item.foto}
                              alt="foto kejadian"
                              className="h-20 w-20 object-cover transition duration-300 hover:scale-105"
                            />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-3 py-4 align-top text-slate-700">{item.deskripsi_kejadian || '-'}</td>
                      <td className="px-3 py-4 align-top">{item.lokasi || '-'}</td>
                      <td className="px-3 py-4 align-top">{item.jenis_cedera || '-'}</td>
                      <td className="px-3 py-4 align-top">{item.pertolongan_pertama || '-'}</td>
                      <td className="px-3 py-4 align-top">{item.nama_petugas || '-'}</td>
                      <td className="px-3 py-4 align-top text-slate-700 font-semibold">{item.tingkat_resiko || '-'}</td>
                      <td className="px-3 py-4 align-top">{item.pencegahan_ke_depan || '-'}</td>
                      <td className="relative px-3 py-4 align-top text-center">
                        <button
                          type="button"
                          onClick={() => setActionMenuId(actionMenuId === item._id ? null : item._id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {actionMenuId === item._id && (
                          <div className="absolute right-3 top-12 z-20 w-44 rounded-3xl border border-slate-200 bg-white shadow-lg">
                            <button
                              onClick={() => {
                                openEditModal(item);
                                setActionMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDelete({ show: true, laporanId: item._id });
                                setActionMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-slate-900">
              <img
                src={selectedImage}
                alt="Foto kejadian besar"
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH / EDIT ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">
                Laporan Kecelakaan
              </p>
              <h4 className="mt-2 text-2xl font-semibold">
              {editId ? "Edit Laporan" : "Tambah Laporan"}
              </h4>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* FOTO */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-700">Foto Kejadian *</label>
                    <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPhotoMode("camera")}
                        className={`rounded-xl px-3 py-2 transition ${photoMode === "camera" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
                      >
                        Kamera
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoMode("gallery")}
                        className={`rounded-xl px-3 py-2 transition ${photoMode === "gallery" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
                      >
                        Galeri
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture={photoMode === "camera" ? "environment" : undefined}
                    onChange={(e) => setFoto(e.target.files[0])}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500">
                    Pilih <span className="font-semibold">Kamera</span> untuk ambil foto langsung, atau <span className="font-semibold">Galeri</span> untuk pilih file yang sudah ada.
                  </p>
                </div>

                {/* DESKRIPSI */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Deskripsi Kejadian *</label>
                  <textarea
                    value={form.deskripsi_kejadian}
                    onChange={(e) => setForm({ ...form, deskripsi_kejadian: e.target.value })}
                    className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                    placeholder="Jelaskan kronologi kejadian"
                  />
                </div>

                {/* TOGGLE DETAIL */}
                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowDetail(!showDetail)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {showDetail ? "Sembunyikan detail tambahan" : "Tampilkan detail tambahan"}
                  </button>
                </div>

                {/* DETAIL TAMBAHAN */}
                {showDetail && (
                  <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Lokasi (Gedung)</label>
                      <select
                        value={form.lokasi}
                        onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Pilih Gedung</option>
                        {bangunanList.map((bangunan) => (
                          <option key={bangunan._id} value={bangunan.nama}>
                            {bangunan.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Penyebab</label>
                      <input
                        placeholder="Penyebab"
                        value={form.penyebab}
                        onChange={(e) => setForm({ ...form, penyebab: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Tingkat Resiko</label>
                      <select
                        value={form.tingkat_resiko}
                        onChange={(e) => setForm({ ...form, tingkat_resiko: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Pilih Tingkat Resiko</option>
                        {opsiResiko.map((resiko) => (
                          <option key={resiko} value={resiko}>
                            {resiko}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Jenis Cedera</label>
                      <input
                        placeholder="Jenis Cedera"
                        value={form.jenis_cedera}
                        onChange={(e) => setForm({ ...form, jenis_cedera: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Pertolongan Pertama</label>
                      <input
                        placeholder="Pertolongan Pertama"
                        value={form.pertolongan_pertama}
                        onChange={(e) => setForm({ ...form, pertolongan_pertama: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Nama Petugas</label>
                      <input
                        placeholder="Nama Petugas"
                        value={form.nama_petugas}
                        onChange={(e) => setForm({ ...form, nama_petugas: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Pencegahan Ke Depan</label>
                      <textarea
                        placeholder="Pencegahan Ke Depan"
                        value={form.pencegahan_ke_depan}
                        onChange={(e) => setForm({ ...form, pencegahan_ke_depan: e.target.value })}
                        className="min-h-[110px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setShowDetail(false);
                    setPhotoMode("camera");
                  }}
                  className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={simpanLaporan}
                  className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL HAPUS ================= */}
      {confirmDelete.show && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 backdrop-blur-sm bg-black/20 z-50">
          <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
              <Trash2 className="text-white text-4xl" />
            </div>
            <p className="text-xl font-semibold">Hapus Laporan?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, laporanId: null })}
                className="bg-gray-300 px-5 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={hapusLaporan}
                className="bg-red-600 text-white px-5 py-2 rounded"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP ================= */}
      {popup.show && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center space-y-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                popup.success ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span className="text-white text-3xl">
                {popup.success ? "✓" : "✕"}
              </span>
            </div>
            <p className="text-lg">{popup.message}</p>
            <button
              onClick={() => setPopup({ ...popup, show: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
