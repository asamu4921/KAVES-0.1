import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, MoreVertical } from "lucide-react";

export default function Gedung({ workspaceId }) {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const workspaceName = localStorage.getItem("workspace_aktif_nama") || "";

  const [gedungList, setGedungList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [namaBangunan, setNamaBangunan] = useState("");
  const [editId, setEditId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({ show: false, gedungId: null });

  const [popup, setPopup] = useState({ show: false, message: "", success: true });

  const fetchGedung = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/bangunan/list?ruangkerja_id=${workspaceId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setGedungList(data.data || []);
      else setGedungList([]);
    } catch {
      setGedungList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGedung();
  }, [workspaceId]);

  const simpanGedung = async () => {
    if (!namaBangunan.trim()) {
      setPopup({ show: true, message: "Nama gedung wajib diisi", success: false });
      return;
    }

    try {
      const url = editId
        ? `${backendURL}/api/bangunan/edit?bangunan_id=${editId}`
        : `${backendURL}/api/bangunan/buat?ruangkerja_id=${workspaceId}`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nama: namaBangunan }),
      });

      const data = await res.json();

      if (data.success) {
        setPopup({
          show: true,
          message: editId ? "Gedung berhasil diupdate!" : "Gedung berhasil ditambahkan!",
          success: true,
        });
        setModalOpen(false);
        setNamaBangunan("");
        setEditId(null);
        fetchGedung();
      } else {
        setPopup({ show: true, message: data.message || "Gagal menyimpan gedung", success: false });
      }
    } catch {
      setPopup({ show: true, message: "Kesalahan server saat menyimpan gedung", success: false });
    }
  };

  const hapusGedung = async () => {
    try {
      const res = await fetch(
        `${backendURL}/api/bangunan/hapus?bangunan_id=${confirmDelete.gedungId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setPopup({ show: true, message: "Gedung berhasil dihapus!", success: true });
        fetchGedung();
      } else {
        setPopup({ show: true, message: data.message || "Gagal menghapus gedung", success: false });
      }
    } catch {
      setPopup({ show: true, message: "Kesalahan server saat menghapus gedung", success: false });
    } finally {
      setConfirmDelete({ show: false, gedungId: null });
    }
  };

  const openEditModal = (gedung) => {
    setNamaBangunan(gedung.nama);
    setEditId(gedung._id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5 relative">
      <h3 className="text-2xl font-bold">
        Daftar Gedung: <span className="text-green-600">{workspaceName}</span>
      </h3>

      {/* Kartu Tambah Gedung */}
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full sm:max-w-xs">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-6">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-white uppercase">
            Gedung
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">{workspaceName}</h2>
        </div>
        <div className="p-5">
          <button
            onClick={() => { setModalOpen(true); setNamaBangunan(""); setEditId(null); }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/50 transition hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" />
            Tambah Gedung
          </button>
        </div>
      </div>

      {/* Modal Tambah/Edit Gedung */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 backdrop-blur-sm bg-black/20 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h4 className="text-lg font-semibold">{editId ? "Edit Gedung" : "Tambah Gedung"}</h4>
            <input
              value={namaBangunan}
              onChange={(e) => setNamaBangunan(e.target.value)}
              placeholder="Nama gedung"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setModalOpen(false); setEditId(null); }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={simpanGedung}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel List Gedung */}
      <div className="bg-white p-4 shadow-2xl rounded-3xl">
        <h4 className="text-lg font-semibold mb-3">List Gedung</h4>

        {loading ? (
          <p>Memuat...</p>
        ) : gedungList.length === 0 ? (
          <p className="text-gray-600">Belum ada gedung.</p>
        ) : (
          <>
            <div className="space-y-4 lg:hidden">
              {gedungList.map((item, index) => (
                <div key={item._id} className="relative overflow-visible rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500">{index + 1}.</span>
                        <h5 className="text-base font-semibold text-slate-900">{item.nama}</h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActionMenuId(actionMenuId === item._id ? null : item._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm hover:bg-white"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {actionMenuId === item._id && (
                    <div className="absolute top-16 right-4 z-20 w-44 rounded-3xl border border-slate-200 bg-white shadow-lg">
                      <button
                        onClick={() => { openEditModal(item); setActionMenuId(null); }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => { setConfirmDelete({ show: true, gedungId: item._id }); setActionMenuId(null); }}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.15em] text-[12px]">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nama Gedung</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {gedungList.map((item, index) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 align-top text-slate-700">{index + 1}</td>
                      <td className="px-4 py-4 align-top text-slate-800">{item.nama}</td>
                      <td className="relative px-4 py-4 align-top text-center">
                        <button
                          type="button"
                          onClick={() => setActionMenuId(actionMenuId === item._id ? null : item._id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {actionMenuId === item._id && (
                          <div className="absolute right-1 top-12 z-20 w-44 rounded-3xl border border-slate-200 bg-white shadow-lg">
                            <button
                              onClick={() => { openEditModal(item); setActionMenuId(null); }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => { setConfirmDelete({ show: true, gedungId: item._id }); setActionMenuId(null); }}
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


      {/* Modal Konfirmasi Hapus */}
      {confirmDelete.show && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 backdrop-blur-sm bg-black/20 z-50">
          <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow">
              <Trash2 className="text-white text-4xl" />
            </div>
            <p className="text-xl font-semibold text-center text-gray-700">
              Hapus Gedung?
            </p>
            <p className="text-center text-gray-500 text-sm px-4">
              Gedung ini akan dihapus permanen dari workspace.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, gedungId: null })}
                className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400 font-medium"
              >
                Batal
              </button>
              <button
                onClick={hapusGedung}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Sukses/Gagal */}
      {popup.show && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center space-y-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                popup.success ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span className="text-white text-3xl">{popup.success ? "✓" : "✕"}</span>
            </div>
            <div className="text-center text-lg font-medium">{popup.message}</div>
            <button
              onClick={() => setPopup({ ...popup, show: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
