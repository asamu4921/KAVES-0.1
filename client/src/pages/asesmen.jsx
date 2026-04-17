import { useState, useEffect } from "react";

function Asesmen({ workspaceId }) {
  const [bangunanList, setBangunanList] = useState([]);
  const [selectedBangunan, setSelectedBangunan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    nomor_surat: "",
    tugas: "",
    lokasi: "",
    peralatan: "",
    jenis_pekerjaan: "",
    jenis_bahaya: "",
    cause_effect: "",
    likelihood: "",
    severity: "",
    risk: "",
    level: "",
    impact: "",
    danger: "",
    prevensi: ""
  });

  const resetForm = () => {
    setFormData({
      nomor_surat: "",
      tugas: "",
      lokasi: "",
      peralatan: "",
      jenis_pekerjaan: "",
      jenis_bahaya: "",
      cause_effect: "",
      likelihood: "",
      severity: "",
      risk: "",
      level: "",
      impact: "",
      danger: "",
      prevensi: ""
    });
  };

  const resetDetailForm = () => {
    setFormData((prev) => ({
      ...prev,
      jenis_pekerjaan: "",
      jenis_bahaya: "",
      cause_effect: "",
      likelihood: "",
      severity: "",
      risk: "",
      level: "",
      impact: "",
      danger: "",
      prevensi: ""
    }));
  };

  useEffect(() => {
    if (!workspaceId) return;
    const fetchBangunan = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendURL}/api/bangunan/list?ruangkerja_id=${workspaceId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setBangunanList(data.data || []);
      } catch {
        console.log("Gagal mengambil data bangunan");
      }
      setLoading(false);
    };
    fetchBangunan();
  }, [workspaceId]);

  const handleChange = (field, value) => {
    const newData = { ...formData };
    const levelMap = {
      "1": { text: "Rare", likelihood: 1 },
      "2": { text: "Unlikely", likelihood: 2 },
      "3": { text: "Possible", likelihood: 3 },
      "4": { text: "Likely", likelihood: 4 },
      "5": { text: "Almost Certain", likelihood: 5 },
    };
    const impactMap = {
      "1": { text: "Insignificant", severity: 1 },
      "2": { text: "Minor", severity: 2 },
      "3": { text: "Moderate", severity: 3 },
      "4": { text: "Major", severity: 4 },
      "5": { text: "Fatal", severity: 5 },
    };

    if (field === "level" && value in levelMap) {
      newData.level = value;
      newData.likelihood = levelMap[value].likelihood;
    } else if (field === "impact" && value in impactMap) {
      newData.impact = value;
      newData.severity = impactMap[value].severity;
    } else newData[field] = value;

    const likelihood = Number(newData.likelihood) || 0;
    const severity = Number(newData.severity) || 0;
    const risk = likelihood * severity;
    newData.risk = risk;
    newData.danger = risk >= 17 ? "Catastrophic" : risk >= 10 ? "High" : risk >= 5 ? "Medium" : "Low";

    setFormData(newData);
  };

  const handleSubmitAsesmen = async (e) => {
    e.preventDefault();
    if (!selectedBangunan) {
      setPopup({ show: true, message: "Pilih bangunan terlebih dahulu", success: false });
      return;
    }
    try {
      const res = await fetch(
        `${backendURL}/api/asesmen/tambah?bangunan_id=${selectedBangunan._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success) {
        setPopup({ show: true, message: "Asesmen berhasil ditambahkan", success: true });
        resetDetailForm();
      } else {
        setPopup({ show: true, message: data.message || "Gagal menambah asesmen", success: false });
      }
    } catch {
      setPopup({ show: true, message: "Kesalahan server", success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[32px] overflow-hidden bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-7">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">
              Asesmen
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Tambah Data Asesmen
            </h1>
            <p className="mt-2 text-sm text-white/90">
              Pilih bangunan dulu, lalu lengkapi form asesmen dengan data baru.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Pilih Gedung</span>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none"
                  value={selectedBangunan?._id || ""}
                  onChange={(e) => {
                    const b = bangunanList.find((x) => x._id === e.target.value);
                    setSelectedBangunan(b);
                    resetDetailForm();
                  }}
                >
                  <option value="">-- Pilih Gedung --</option>
                  {bangunanList.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.nama}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedBangunan ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 font-semibold">
                      Gedung
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      {selectedBangunan.nama}
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleSubmitAsesmen} className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Nomor Surat</span>
                    <input
                      value={formData.nomor_surat}
                      onChange={(e) => handleChange("nomor_surat", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Contoh: MCS-TWA-K3-001"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tugas</span>
                    <input
                      value={formData.tugas}
                      onChange={(e) => handleChange("tugas", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Tugas yang sedang dilakukan"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Lokasi</span>
                    <input
                      value={formData.lokasi}
                      onChange={(e) => handleChange("lokasi", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Lokasi detail asesmen"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Peralatan</span>
                    <input
                      value={formData.peralatan}
                      onChange={(e) => handleChange("peralatan", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Peralatan yang digunakan"
                    />
                  </label>

                  <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                    Field <span className="font-semibold">Disetujui Oleh</span> dan <span className="font-semibold">Tanggal Disetujui</span> diisi otomatis oleh sistem berdasarkan owner workspace.
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Jenis Pekerjaan</span>
                    <input
                      required
                      value={formData.jenis_pekerjaan}
                      onChange={(e) => handleChange("jenis_pekerjaan", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Jenis pekerjaan"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Jenis Bahaya</span>
                    <input
                      required
                      value={formData.jenis_bahaya}
                      onChange={(e) => handleChange("jenis_bahaya", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Jenis bahaya"
                    />
                  </label>

                  <label className="col-span-2 space-y-2">
                    <span className="text-sm font-medium text-slate-700">Cause & Effect</span>
                    <textarea
                      value={formData.cause_effect}
                      onChange={(e) => handleChange("cause_effect", e.target.value)}
                      className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Deskripsi cause & effect"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Level</span>
                    <select
                      required
                      value={formData.level}
                      onChange={(e) => handleChange("level", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih level</option>
                      <option value="1">1 - Rare</option>
                      <option value="2">2 - Unlikely</option>
                      <option value="3">3 - Possible</option>
                      <option value="4">4 - Likely</option>
                      <option value="5">5 - Almost Certain</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Impact</span>
                    <select
                      required
                      value={formData.impact}
                      onChange={(e) => handleChange("impact", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Pilih impact</option>
                      <option value="1">1 - Insignificant</option>
                      <option value="2">2 - Minor</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - Major</option>
                      <option value="5">5 - Fatal</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Risk</span>
                    <input
                      readOnly
                      value={formData.risk}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                      placeholder="Risk"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Danger</span>
                    <input
                      readOnly
                      value={formData.danger}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                      placeholder="Danger"
                    />
                  </label>

                  <label className="col-span-2 space-y-2">
                    <span className="text-sm font-medium text-slate-700">Prevensi</span>
                    <textarea
                      value={formData.prevensi}
                      onChange={(e) => handleChange("prevensi", e.target.value)}
                      className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Rencana pencegahan ke depan"
                    />
                  </label>

                  <div className="col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => resetDetailForm()}
                      className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Reset Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => resetForm()}
                      className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Reset Semua
                    </button>
                    <button
                      type="submit"
                      className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Simpan Asesmen
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                Pilih gedung terlebih dahulu untuk mengisi form asesmen.
              </div>
            )}
          </div>
        </div>

        {popup.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 px-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white ${popup.success ? "bg-emerald-500" : "bg-red-500"}`}>
                {popup.success ? "✓" : "✕"}
              </div>
              <p className="text-lg font-semibold text-slate-900">{popup.message}</p>
              <button
                onClick={() => setPopup({ ...popup, show: false })}
                className="mt-5 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Asesmen;

