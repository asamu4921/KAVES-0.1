import { useState } from "react";

export default function Welcome() {
  const [nama, setNama] = useState("");
  const [workspaceId, setWorkspaceId] = useState(null);
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Buat workspace baru
  const buatWorkspace = async () => {
    if (!nama.trim()) {
      setMessage("Nama workspace tidak boleh kosong");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${backendURL}/api/ruangkerja/buat-ruangkerja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nama })
      });

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Gagal membuat workspace");
        setLoading(false);
        return;
      }

      const id = data.data._id;
      setWorkspaceId(id);

      // set workspace sebagai aktif di backend
      await fetch(`${backendURL}/api/auth/workspace/set-aktif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workspace_id: id })
      });

    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan, silakan coba lagi");
    }

    setLoading(false);
  };

  const tambahEmailField = () => {
    setEmails([...emails, ""]);
  };

  const updateEmail = (value, index) => {
    const list = [...emails];
    list[index] = value;
    setEmails(list);
  };

  // Kirim undangan anggota
  const kirimUndangan = async () => {
    if (!workspaceId) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${backendURL}/api/ruangkerja/undang?ruangkerja_id=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emails })
      });

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Gagal mengirim undangan");
        setLoading(false);
        return;
      }

      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan, silakan coba lagi");
    }

    setLoading(false);
  };

  // Skip undangan
  const skipUndangan = async () => {
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-500 px-8 py-10 text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-100">Selamat Datang</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Buat workspace pertama Anda</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100/90">
              Lengkapi workspace untuk mulai mengundang anggota, membuat laporan, dan menggunakan fitur KAVES sepenuhnya.
            </p>
          </div>
          <div className="p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-600">Langkah Singkat</p>
                  <ol className="mt-4 space-y-3 text-slate-700">
                    <li className="flex gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">1</span>
                      Isi nama workspace.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">2</span>
                      Tambahkan anggota opsional.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">3</span>
                      Lanjutkan ke dashboard dan mulailah bekerja.
                    </li>
                  </ol>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <p className="text-sm font-semibold text-slate-500">Keterangan</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Setelah membuat workspace, Anda dapat menambahkan anggota atau langsung masuk ke dashboard. Jika belum menambahkan anggota, Anda tetap dapat melakukannya nanti.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-50 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Status Progress</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{workspaceId ? "Sudah dibuat" : "Belum dibuat"}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Undangan</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{workspaceId ? "Menunggu anggota" : "Belum tersedia"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Setup Workspace</h2>
                <p className="mt-2 text-sm text-slate-500">Mulai dari nama workspace hingga undangan anggota.</p>
              </div>
              <div className="text-sm font-medium text-slate-500">Step {workspaceId ? 2 : 1} dari 2</div>
            </div>

            <div className="mt-8 space-y-6">
              {message && (
                <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-100">
                  {message}
                </div>
              )}

              {!workspaceId ? (
                <div className="space-y-5">
                  <label className="block text-sm font-medium text-slate-700">
                    Nama Workspace
                    <input
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: KAVES Pusat"
                      className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <button
                    onClick={buatWorkspace}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? "Membuat workspace..." : "Buat Workspace"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-3xl bg-slate-50 p-5 text-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">Workspace siap</p>
                    <p className="mt-2 text-sm">{nama || "Workspace baru Anda"} telah dibuat. Tambahkan anggota melalui email atau lanjutkan langsung.</p>
                  </div>

                  <div className="space-y-4">
                    {emails.map((email, index) => (
                      <label key={index} className="block text-sm font-medium text-slate-700">
                        Email anggota #{index + 1}
                        <input
                          value={email}
                          onChange={(e) => updateEmail(e.target.value, index)}
                          placeholder="contoh@domain.com"
                          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={tambahEmailField}
                      type="button"
                      className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Tambah Email
                    </button>
                    <button
                      onClick={kirimUndangan}
                      type="button"
                      disabled={loading}
                      className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? "Mengirim undangan..." : "Kirim Undangan"}
                    </button>
                    <button
                      onClick={skipUndangan}
                      type="button"
                      className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Lewati
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Kenapa perlu workspace?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Workspace adalah wadah untuk semua data laporankecelakaan, asesmen, dan anggota. Dengan workspace, Anda dapat mengelola tim dan aktivitas K3 secara terorganisir.
            </p>

            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Simpan data tersentralisasi untuk satu lokasi kerja.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Undang tim dan atur peran dengan mudah.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Mulai rekaman laporan serta asesmen tanpa konfigurasi tambahan.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
