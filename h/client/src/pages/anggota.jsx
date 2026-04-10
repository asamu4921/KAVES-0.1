import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Plus, Trash2, Users, X } from "lucide-react";

export default function Anggota({ workspaceId }) {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const currentUserId = localStorage.getItem("user_id");
  const workspaceName = localStorage.getItem("workspace_aktif_nama") || "";

  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(false);

  const [emails, setEmails] = useState([""]);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const [popup, setPopup] = useState({ show: false, message: "", success: true });
  const [confirmKick, setConfirmKick] = useState({ show: false, memberId: null });

  const fetchAnggota = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${backendURL}/api/ruangkerja/anggota?ruangkerja_id=${workspaceId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        const owner = data.data.find(a => a.role === "owner");
        if (owner) owner.user_id = currentUserId;
        setAnggota(data.data || []);
      } else {
        setAnggota([]);
      }
    } catch (err) {
      console.error(err);
      setAnggota([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnggota();
  }, [workspaceId]);

  const ownerObj = anggota.find(a => a.role === "owner");
  const isOwner = ownerObj && ownerObj.user_id === currentUserId;

  const tambahEmailField = () => setEmails((s) => [...s, ""]);
  const updateEmail = (value, idx) => setEmails((s) => s.map((v, i) => (i === idx ? value : v)));
  const resetEmails = () => setEmails([""]);

  const kirimUndangan = async () => {
    if (!workspaceId) return;

    const list = emails.map(e => e.trim()).filter(Boolean);
    if (list.length === 0) {
      alert("Isi minimal satu email");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch(`${backendURL}/api/ruangkerja/undang?ruangkerja_id=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emails: list }),
      });
      const data = await res.json();
      if (data.success) {
        setPopup({ show: true, message: "Anggota berhasil diundang!", success: true });
        resetEmails();
        setShowInviteForm(false);
        await fetchAnggota();
      } else {
        setPopup({ show: true, message: data.message || "Gagal mengundang anggota", success: false });
      }
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Terjadi kesalahan saat mengundang", success: false });
    } finally {
      setInviting(false);
    }
  };

  const keluarkanAnggota = async (memberUserId) => {
    if (!memberUserId) return;
    

    try {
      const res = await fetch(
        `${backendURL}/api/ruangkerja/keluarkan?ruangkerja_id=${workspaceId}&user_target=${memberUserId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setPopup({ show: true, message: data.message || "Anggota berhasil dikeluarkan", success: true });
        fetchAnggota();
      } else {
        setPopup({ show: true, message: data.message || "Gagal mengeluarkan anggota", success: false });
      }
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Terjadi kesalahan saat mengeluarkan anggota", success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-500 px-8 py-10">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">Manajemen Anggota</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Tim Workspace {workspaceName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">
              Undang anggota baru, monitor peran tim, dan keluarkan akses yang tidak diperlukan.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_auto] lg:items-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Total Anggota</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{anggota.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Peran Anda</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{isOwner ? "Pemilik" : "Anggota"}</p>
                </div>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowInviteForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Undang Anggota
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Daftar Anggota</h2>
              <p className="text-sm text-slate-500">{anggota.length} anggota terdaftar di workspace ini.</p>
            </div>
            {isOwner && <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">Akses pemilik aktif</span>}
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">Memuat anggota...</div>
          ) : anggota.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">Belum ada anggota.</div>
          ) : (
            <>
              <div className="mt-6 space-y-4 lg:hidden">
                {anggota.map((item) => (
                  <div key={item.user_id || item.email} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.role}</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.nama || item.email}</h3>
                        <p className="mt-2 text-sm text-slate-600">{item.email || "-"}</p>
                      </div>
                      {isOwner && item.role !== "owner" && (
                        <button
                          type="button"
                          onClick={() => setConfirmKick({ show: true, memberId: item.user_id })}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-left text-sm leading-6">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.15em] text-[12px]">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      {isOwner && <th className="px-4 py-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {anggota.map((item, index) => (
                      <tr key={item.user_id || item.email} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-700">{index + 1}</td>
                        <td className="px-4 py-4 text-slate-800">{item.nama || "-"}</td>
                        <td className="px-4 py-4 text-slate-700">{item.email || "-"}</td>
                        <td className="px-4 py-4 text-slate-700">{item.role}</td>
                        {isOwner && (
                          <td className="px-4 py-4 text-center">
                            {item.role !== "owner" ? (
                              <button
                                type="button"
                                onClick={() => setConfirmKick({ show: true, memberId: item.user_id })}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Owner</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Undang Anggota Baru</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Kirim undangan lewat email</h3>
              </div>
              <button
                type="button"
                onClick={() => { resetEmails(); setShowInviteForm(false); }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {emails.map((em, idx) => (
                <label key={idx} className="block">
                  <span className="text-sm font-medium text-slate-700">Email anggota #{idx + 1}</span>
                  <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={em}
                      onChange={(e) => updateEmail(e.target.value, idx)}
                      placeholder="contoh@domain.com"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={tambahEmailField}
                className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Tambah Email
              </button>
              <button
                type="button"
                onClick={kirimUndangan}
                disabled={inviting}
                className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {inviting ? "Mengirim..." : "Kirim Undangan"}
              </button>
              <button
                type="button"
                onClick={() => { resetEmails(); setShowInviteForm(false); }}
                className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmKick.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">Keluarkan Anggota?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Anggota akan dikeluarkan dari workspace dan tidak dapat mengaksesnya lagi.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setConfirmKick({ show: false, memberId: null })}
                className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmKick.memberId;
                  setConfirmKick({ show: false, memberId: null });
                  keluarkanAnggota(id);
                }}
                className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Ya, keluarkan
              </button>
            </div>
          </div>
        </div>
      )}

      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-center rounded-full bg-slate-900 p-4 text-white w-16 h-16 mx-auto">
              {popup.success ? <CheckCircle2 className="h-8 w-8" /> : <X className="h-8 w-8" />}
            </div>
            <div className="mt-5 text-center text-lg font-semibold text-slate-900">{popup.message}</div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPopup({ ...popup, show: false })}
                className="rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
