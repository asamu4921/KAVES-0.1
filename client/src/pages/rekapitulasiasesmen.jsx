import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, MoreVertical, Edit3, Trash2 } from "lucide-react";

function RekapitulasiAsesmen({ workspaceId }) {
  const [bangunanList, setBangunanList] = useState([]);
  const [selectedBangunan, setSelectedBangunan] = useState(null);
  const [asesmenList, setAsesmenList] = useState([]);
  const [asesmenAll, setAsesmenAll] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editAsesmen, setEditAsesmen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [actionMenuId, setActionMenuId] = useState(null);
  const [workspaceData, setWorkspaceData] = useState(null);
  const [selectedNomorSuratExport, setSelectedNomorSuratExport] = useState("");
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
    prevensi: "",
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
      prevensi: "",
    });
  };
  const getDangerFromRisk = (riskValue) => {
    const risk = Number(riskValue) || 0;
    return risk >= 17 ? "Catastrophic" : risk >= 10 ? "High" : risk >= 5 ? "Medium" : "Low";
  };
  const handleChange = (field, value) => {
  const newData = { ...formData };

  const levelMap = {
    "1": { likelihood: 1 },
    "2": { likelihood: 2 },
    "3": { likelihood: 3 },
    "4": { likelihood: 4 },
    "5": { likelihood: 5 },
  };

  const impactMap = {
    "1": { severity: 1 },
    "2": { severity: 2 },
    "3": { severity: 3 },
    "4": { severity: 4 },
    "5": { severity: 5 },
  };

  if (field === "level" && levelMap[value]) {
    newData.level = value;
    newData.likelihood = levelMap[value].likelihood;
  } else if (field === "impact" && impactMap[value]) {
    newData.impact = value;
    newData.severity = impactMap[value].severity;
  } else {
    newData[field] = value;
  }

  const likelihood = Number(newData.likelihood) || 0;
  const severity = Number(newData.severity) || 0;

  newData.risk = likelihood * severity;
  newData.danger = getDangerFromRisk(newData.risk);

  setFormData(newData);
};
const handleUpdateAsesmen = async (e) => {
  e.preventDefault();
  if (!editAsesmen?._id) return;

  const payload = { ...formData };
  delete payload._id;
  delete payload.tanggal_dibuat;
  delete payload.dibuat_oleh;
  delete payload.disetujui_oleh;
  delete payload.tanggal_disetujui;

  const res = await fetch(
    `${backendURL}/api/asesmen/edit?asesmen_id=${editAsesmen._id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (data.success) {
    fetchAsesmen(selectedBangunan._id);
    setShowForm(false);
    setEditAsesmen(null);
    resetForm();
  } else {
    alert(data.message || "Gagal update asesmen");
  }
};
const handleDeleteAsesmen = async () => {
  const res = await fetch(
    `${backendURL}/api/asesmen/hapus?asesmen_id=${confirmDelete.id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await res.json();
  if (data.success) {
    fetchAsesmen(selectedBangunan._id);
  } else {
    alert(data.message || "Gagal hapus asesmen");
  }

  setConfirmDelete({ show: false, id: null });
};

  /* ======================
     FETCH BANGUNAN
  ====================== */
  useEffect(() => {
    if (!workspaceId) return;

    fetch(`${backendURL}/api/bangunan/list?ruangkerja_id=${workspaceId}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBangunanList(data.data || []);
      });
  }, [workspaceId]);

  /* ======================
     FETCH WORKSPACE DETAIL
  ====================== */
  useEffect(() => {
    if (!workspaceId) return;

    fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const workspace = data.data.find(ws => ws._id === workspaceId);
          if (workspace) {
            setWorkspaceData(workspace);
          }
        }
      })
      .catch(err => console.error("Gagal fetch workspace detail:", err));
  }, [workspaceId]);

  /* ======================
     FETCH ASESMEN
  ====================== */
  const fetchAsesmen = async (bangunanId) => {
    const res = await fetch(
      `${backendURL}/api/asesmen/list?bangunan_id=${bangunanId}`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (data.success) {
      setAsesmenAll(data.data);
      setAsesmenList(data.data);
    }
  };

  /* ======================
     FILTER & SEARCH
  ====================== */
  const [filterMode, setFilterMode] = useState("date");
// "date" | "month" | "year"

  const sameDate = (a, b) =>
  new Date(a).toISOString().slice(0, 10) ===
  new Date(b).toISOString().slice(0, 10);

  useEffect(() => {
  let filtered = asesmenAll;

  if (filterTanggal) {
    filtered = filtered.filter(a => {
      if (!a.tanggal_dibuat) return false;

      const d = new Date(a.tanggal_dibuat);

      if (filterMode === "date") {
        return d.toISOString().slice(0, 10) === filterTanggal;
      }

      if (filterMode === "month") {
        const [year, month] = filterTanggal.split("-");
        return (
          d.getFullYear() === Number(year) &&
          d.getMonth() + 1 === Number(month)
        );
      }

      if (filterMode === "year") {
        return d.getFullYear() === Number(filterTanggal);
      }

      return true;
    });
  }

  if (search) {
    filtered = filtered.filter(a =>
      a.jenis_pekerjaan.toLowerCase().includes(search.toLowerCase()) ||
      a.jenis_bahaya.toLowerCase().includes(search.toLowerCase()) ||
      (a.nomor_surat || "").toLowerCase().includes(search.toLowerCase())
    );
  }

  setAsesmenList(filtered);
}, [filterTanggal, filterMode, search, asesmenAll]);

  const groupedAsesmen = useMemo(() => {
    const groups = {};

    asesmenList.forEach((item) => {
      const key = (item.nomor_surat || "").trim() || "Tanpa Nomor Surat";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups)
      .map(([nomorSurat, items]) => ({ nomorSurat, items }))
      .sort((a, b) => {
        if (a.nomorSurat === "Tanpa Nomor Surat") return 1;
        if (b.nomorSurat === "Tanpa Nomor Surat") return -1;
        return a.nomorSurat.localeCompare(b.nomorSurat);
      });
  }, [asesmenList]);

  const exportNomorSuratOptions = useMemo(() => {
    const mapped = new Map();
    asesmenList.forEach((item) => {
      const raw = (item.nomor_surat || "").trim();
      const key = raw || "__TANPA_SURAT__";
      if (!mapped.has(key)) {
        mapped.set(key, raw || "Tanpa Nomor Surat");
      }
    });

    return Array.from(mapped.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => {
        if (a.value === "__TANPA_SURAT__") return 1;
        if (b.value === "__TANPA_SURAT__") return -1;
        return a.label.localeCompare(b.label);
      });
  }, [asesmenList]);

  useEffect(() => {
    if (exportNomorSuratOptions.length === 0) {
      setSelectedNomorSuratExport("");
      return;
    }

    const stillExists = exportNomorSuratOptions.some((opt) => opt.value === selectedNomorSuratExport);
    if (!stillExists) {
      setSelectedNomorSuratExport("");
    }
  }, [exportNomorSuratOptions, selectedNomorSuratExport]);

  /* ======================
     EXPORT PDF
  ====================== */
// ================================
// FUNGSI CETAK PDF (GANTI INI)
// ================================
const getPeriodeLaporan = (data) => {
  if (!data || !data.length) return "PERIODE -";

  const dates = data
    .filter(a => a.tanggal_dibuat)
    .map(a => new Date(a.tanggal_dibuat))
    .sort((a, b) => a - b);

  const start = dates[0];
  const end = dates[dates.length - 1];

  const startMonth = start.toLocaleString("id-ID", { month: "long" }).toUpperCase();
  const startYear = start.getFullYear();

  const endMonth = end.toLocaleString("id-ID", { month: "long" }).toUpperCase();
  const endYear = end.getFullYear();

  if (
    start.getMonth() === end.getMonth() &&
    startYear === endYear
  ) {
    return `BULAN ${startMonth} TAHUN ${startYear}`;
  }

  if (startYear === endYear) {
    return `PERIODE ${startMonth} – ${endMonth} ${startYear}`;
  }

  return `PERIODE ${startMonth} ${startYear} – ${endMonth} ${endYear}`;
};

const safeFileText = (text) =>
  text
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_");

const getCellFillByDanger = (danger) => {
  const value = (danger || "").toLowerCase();
  if (value === "catastrophic" || value === "katastropik") return [153, 27, 27];
  if (value === "high") return [194, 65, 12];
  if (value === "medium") return [202, 138, 4];
  return [21, 128, 61];
};

const loadImageAsDataUrl = async (url) => {
  const proxyUrl = `${backendURL}/api/ruangkerja/logo-proxy?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl, { credentials: "include" });
  if (!response.ok) throw new Error("Gagal mengambil logo");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context tidak tersedia"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar logo"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const handleExportPDF = async () => {
  if (!selectedBangunan || !asesmenList.length) return;

  if (exportNomorSuratOptions.length > 1 && !selectedNomorSuratExport) {
    alert("Pilih nomor surat yang ingin di-print terlebih dahulu.");
    return;
  }

  const exportData = asesmenList.filter((item) => {
    if (!selectedNomorSuratExport) return true;
    if (selectedNomorSuratExport === "__TANPA_SURAT__") {
      return !(item.nomor_surat || "").trim();
    }
    return (item.nomor_surat || "").trim() === selectedNomorSuratExport;
  });

  if (!exportData.length) {
    alert("Tidak ada data untuk nomor surat yang dipilih.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const namaOrganisasi = workspaceData?.nama || "Organisasi";
  const projectName = `IBPR K3 - ${selectedBangunan.nama}`;
  const uniqueNomorSurat = [...new Set(exportData.map((a) => (a.nomor_surat || "").trim()).filter(Boolean))];
  const nomorSuratLabel = uniqueNomorSurat.length === 0
    ? "Tanpa Nomor Surat"
    : uniqueNomorSurat.length === 1
      ? uniqueNomorSurat[0]
      : `Gabungan (${uniqueNomorSurat.length} dokumen)`;
  const assessorName = exportData[0]?.dibuat_oleh?.name || "-";
  const versionLabel = "Rev.01";
  const tanggalLabel = new Date().toLocaleDateString("id-ID");

  const tugasLabel = [...new Set(exportData.map((a) => (a.tugas || "").trim()).filter(Boolean))].join("; ") || "-";
  const lokasiLabel = [...new Set(exportData.map((a) => (a.lokasi || "").trim()).filter(Boolean))].join("; ") || "-";
  const peralatanLabel = [...new Set(exportData.map((a) => (a.peralatan || "").trim()).filter(Boolean))].join("; ") || "-";
  const tugasLokasiPeralatan = `Tugas: ${tugasLabel} | Lokasi: ${lokasiLabel} | Peralatan: ${peralatanLabel}`;

  const logoUrl = workspaceData?.logo_url || workspaceData?.logo;
  const logoBoxW = 24;
  const logoBoxH = 24;
  const headerTop = y;
  const headerHeight = 30;

  if (logoUrl) {
    try {
      const logoDataUrl = await loadImageAsDataUrl(logoUrl);
      const imgProps = doc.getImageProperties(logoDataUrl);
      const ratio = imgProps.width / imgProps.height;

      let drawW = logoBoxW;
      let drawH = drawW / ratio;
      if (drawH > logoBoxH) {
        drawH = logoBoxH;
        drawW = drawH * ratio;
      }

      const imgX = margin + 3 + (logoBoxW - drawW) / 2;
      const imgY = headerTop + 3 + (logoBoxH - drawH) / 2;
      doc.addImage(logoDataUrl, "PNG", imgX, imgY, drawW, drawH);
    } catch (error) {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("LOGO", margin + 15, headerTop + 16, { align: "center" });
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("LOGO", margin + 15, headerTop + 16, { align: "center" });
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("IDENTIFIKASI BAHAYA & PENILAIAN RISIKO (IBPR)", margin + 32, headerTop + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Gedung: ${selectedBangunan.nama}`, margin + 32, headerTop + 16);
  doc.text(`Periode: ${getPeriodeLaporan(exportData)}`, margin + 32, headerTop + 21);
  doc.text(`Tanggal Cetak: ${tanggalLabel}`, margin + 32, headerTop + 26);

  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(1.2);
  doc.line(margin, headerTop + headerHeight + 2, margin + contentWidth, headerTop + headerHeight + 2);
  doc.setLineWidth(0.2);

  y = headerTop + 34;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [[
      "Nama Proyek/Dokumen",
      "Nomor Surat",
      "Nama Organisasi",
      "Penanggung Jawab",
      "Versi"
    ]],
    body: [[
      projectName,
      nomorSuratLabel,
      namaOrganisasi,
      assessorName,
      versionLabel
    ]],
    styles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle"
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      halign: "center"
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    }
  });

  y = doc.lastAutoTable.finalY + 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    body: [
      ["TUGAS/LOKASI/PERALATAN", tugasLokasiPeralatan],
      ["Diases Oleh", assessorName],
      ["Tanggal", tanggalLabel]
    ],
    styles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2,
      overflow: "linebreak"
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 45 }
    }
  });

  y = doc.lastAutoTable.finalY + 5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, bottom: 14 },
    theme: "grid",
    head: [["No", "Jenis Pekerjaan", "Jenis Bahaya", "Cause/Effect", "L", "S", "Risk", "Prevensi"]],
    body: exportData.map((a, i) => {
      const likelihood = Number(a.likelihood) || 0;
      const severity = Number(a.severity) || 0;
      const risk = Number(a.risk) || likelihood * severity;
      const danger = a.danger || getDangerFromRisk(risk);
      return [
        i + 1,
        a.jenis_pekerjaan || "-",
        a.jenis_bahaya || "-",
        a.cause_effect || "-",
        likelihood || "-",
        severity || "-",
        `${risk || "-"} (${danger})`,
        a.prevensi || "-"
      ];
    }),
    styles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle"
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      halign: "center"
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 34 },
      2: { cellWidth: 28 },
      3: { cellWidth: 44 },
      4: { cellWidth: 8, halign: "center" },
      5: { cellWidth: 8, halign: "center" },
      6: { cellWidth: 26, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 30 }
    },
    didParseCell: (hookData) => {
      if (hookData.section !== "body" || hookData.column.index !== 6) return;
      const row = exportData[hookData.row.index];
      const danger = row?.danger || "Low";
      hookData.cell.styles.fillColor = getCellFillByDanger(danger);
      hookData.cell.styles.textColor = [255, 255, 255];
    },
    didDrawPage: (hookData) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Dokumen: ${projectName}`, margin, pageHeight - 7);
      doc.text(`Halaman ${hookData.pageNumber} / ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }
  });

  const filePeriode = safeFileText(getPeriodeLaporan(exportData));
  const fileNomorSurat = safeFileText(nomorSuratLabel);
  const fileName = `IBPR_${selectedBangunan.nama}_${fileNomorSurat}_${filePeriode}.pdf`;
  doc.save(fileName);
};



  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-sky-500 px-8 py-10">
            <p className="text-sm uppercase tracking-[0.4em] text-white/80">Rekapitulasi Asesmen</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Laporan Keselamatan Kerja</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">
              Pantau hasil asesmen per gedung, atur filter laporan, dan ekspor desain laporan dalam format PDF.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_auto] lg:items-end">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Pilih Bangunan</span>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none"
                  onChange={(e) => {
                    const b = bangunanList.find((x) => x._id === e.target.value);
                    setSelectedBangunan(b);
                    fetchAsesmen(e.target.value);
                  }}
                >
                  <option value="">-- Pilih Bangunan --</option>
                  {bangunanList.map((b) => (
                    <option key={b._id} value={b._id}>{b.nama}</option>
                  ))}
                </select>
              </label>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Status Bangunan</p>
                <p className="mt-2">
                  {selectedBangunan ? selectedBangunan.nama : "Pilih bangunan untuk memuat rekapan asesmen."}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Jumlah data: {asesmenList.length}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {selectedBangunan ? `Laporan untuk ${selectedBangunan.nama}` : "Belum ada bangunan yang dipilih."}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedNomorSuratExport}
                  onChange={(e) => setSelectedNomorSuratExport(e.target.value)}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                  disabled={!selectedBangunan || exportNomorSuratOptions.length === 0}
                >
                  <option value="">
                    {exportNomorSuratOptions.length > 1 ? "Pilih Nomor Surat untuk Print" : "Semua data aktif"}
                  </option>
                  {exportNomorSuratOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={!selectedBangunan || asesmenList.length === 0 || (exportNomorSuratOptions.length > 1 && !selectedNomorSuratExport)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/10 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  <Download className="h-4 w-4" />
                  Ekspor PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-2xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Filter</span>
                <select
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                >
                  <option value="date">Tanggal</option>
                  <option value="month">Bulan</option>
                  <option value="year">Tahun</option>
                </select>
              </label>

              {filterMode === "date" && (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Pilih Tanggal</span>
                  <input
                    type="date"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => setFilterTanggal(e.target.value)}
                  />
                </label>
              )}

              {filterMode === "month" && (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Pilih Bulan</span>
                  <input
                    type="month"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => setFilterTanggal(e.target.value)}
                  />
                </label>
              )}

              {filterMode === "year" && (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Pilih Tahun</span>
                  <input
                    type="number"
                    placeholder="2025"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => setFilterTanggal(e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cari pekerjaan atau bahaya</label>
              <input
                type="text"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                placeholder="Cari nomor surat / pekerjaan / bahaya..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Daftar Asesmen</h2>
              <p className="text-sm text-slate-500">
                Menampilkan {asesmenList.length} entri untuk {selectedBangunan?.nama || "-"}.
              </p>
            </div>
          </div>

          {selectedBangunan ? (
            asesmenList.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                Belum ada data asesmen untuk bangunan ini.
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-6 lg:hidden">
                  {groupedAsesmen.map((group) => (
                    <div key={group.nomorSurat} className="space-y-4">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">Nomor Surat</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900">{group.nomorSurat}</p>
                      </div>

                      {group.items.map((a, i) => (
                        <div key={a._id} className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{i + 1}</p>
                              <h3 className="mt-2 text-lg font-semibold text-slate-900">{a.jenis_pekerjaan}</h3>
                              <p className="mt-2 text-sm text-slate-600">{a.jenis_bahaya}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActionMenuId(actionMenuId === a._id ? null : a._id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                              <p className="text-slate-500">Risk</p>
                              <p className="mt-2 font-semibold">{a.risk}</p>
                            </div>
                            <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                              <p className="text-slate-500">Danger</p>
                              <p className="mt-2 font-semibold">{a.danger}</p>
                            </div>
                          </div>

                          {actionMenuId === a._id && (
                            <div className="absolute right-4 top-16 z-20 w-40 rounded-3xl border border-slate-200 bg-white shadow-lg">
                              <button
                                onClick={() => {
                                  const { _id, tanggal_dibuat, dibuat_oleh, ...editable } = a;
                                    setFormData({
                                      ...editable,
                                      risk: Number(editable.likelihood || 0) * Number(editable.severity || 0),
                                      danger: getDangerFromRisk(Number(editable.likelihood || 0) * Number(editable.severity || 0)),
                                    });
                                  setEditAsesmen(a);
                                  setShowForm(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <Edit3 className="h-4 w-4" /> Edit
                              </button>
                              <button
                                onClick={() => { setConfirmDelete({ show: true, id: a._id }); setActionMenuId(null); }}
                                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="hidden space-y-6 lg:block">
                  {groupedAsesmen.map((group) => (
                    <div key={group.nomorSurat} className="overflow-hidden rounded-2xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-emerald-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Nomor Surat</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900">{group.nomorSurat}</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm leading-6">
                          <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.15em] text-[12px]">
                            <tr>
                              <th className="px-4 py-3">No</th>
                              <th className="px-4 py-3">Nomor Surat</th>
                              <th className="px-4 py-3">Pekerjaan</th>
                              <th className="px-4 py-3">Bahaya</th>
                              <th className="px-4 py-3">Likelihood</th>
                              <th className="px-4 py-3">Severity</th>
                              <th className="px-4 py-3">Risk</th>
                              <th className="px-4 py-3">Danger</th>
                              <th className="px-4 py-3">Tanggal</th>
                              <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {group.items.map((a, i) => (
                              <tr key={a._id} className="hover:bg-slate-50">
                                <td className="px-4 py-4 align-top text-slate-700">{i + 1}</td>
                                <td className="px-4 py-4 align-top font-medium text-slate-700">{a.nomor_surat || "-"}</td>
                                <td className="px-4 py-4 align-top text-slate-800">{a.jenis_pekerjaan}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{a.jenis_bahaya}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{a.likelihood}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{a.severity}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{a.risk}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{a.danger}</td>
                                <td className="px-4 py-4 align-top text-slate-700">{new Date(a.tanggal_dibuat).toLocaleDateString()}</td>
                                <td className="relative px-4 py-4 align-top text-center">
                                  <button
                                    type="button"
                                    onClick={() => setActionMenuId(actionMenuId === a._id ? null : a._id)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>

                                  {actionMenuId === a._id && (
                                    <div className="absolute right-2 top-12 z-20 w-40 rounded-3xl border border-slate-200 bg-white shadow-lg">
                                      <button
                                        onClick={() => {
                                          const { _id, tanggal_dibuat, dibuat_oleh, ...editable } = a;
                                            setFormData({
                                              ...editable,
                                              risk: Number(editable.likelihood || 0) * Number(editable.severity || 0),
                                              danger: getDangerFromRisk(Number(editable.likelihood || 0) * Number(editable.severity || 0)),
                                            });
                                          setEditAsesmen(a);
                                          setShowForm(true);
                                          setActionMenuId(null);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Edit3 className="h-4 w-4" /> Edit
                                      </button>
                                      <button
                                        onClick={() => { setConfirmDelete({ show: true, id: a._id }); setActionMenuId(null); }}
                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="h-4 w-4" /> Hapus
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              Silakan pilih bangunan terlebih dahulu untuk melihat rekap asesmen.
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center pt-10 z-50">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Asesmen</h2>

            <form onSubmit={handleUpdateAsesmen} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Nomor Surat</span>
                <input
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.nomor_surat || ""}
                  onChange={(e) => handleChange("nomor_surat", e.target.value)}
                  placeholder="Nomor Surat"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Tugas</span>
                <input
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.tugas || ""}
                  onChange={(e) => handleChange("tugas", e.target.value)}
                  placeholder="Tugas"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Lokasi</span>
                <input
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.lokasi || ""}
                  onChange={(e) => handleChange("lokasi", e.target.value)}
                  placeholder="Lokasi"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Peralatan</span>
                <input
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.peralatan || ""}
                  onChange={(e) => handleChange("peralatan", e.target.value)}
                  placeholder="Peralatan"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Jenis Pekerjaan</span>
                <input
                  required
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.jenis_pekerjaan}
                  onChange={(e) => handleChange("jenis_pekerjaan", e.target.value)}
                  placeholder="Jenis Pekerjaan"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Jenis Bahaya</span>
                <input
                  required
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.jenis_bahaya}
                  onChange={(e) => handleChange("jenis_bahaya", e.target.value)}
                  placeholder="Jenis Bahaya"
                />
              </label>

              <label className="col-span-1 md:col-span-2 space-y-2">
                <span className="text-sm font-medium text-slate-700">Cause & Effect</span>
                <textarea
                  className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.cause_effect}
                  onChange={(e) => handleChange("cause_effect", e.target.value)}
                  placeholder="Cause & Effect"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Level</span>
                <select
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                >
                  <option value="">Pilih Level</option>
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
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.impact}
                  onChange={(e) => handleChange("impact", e.target.value)}
                >
                  <option value="">Pilih Impact</option>
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
                  className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                  value={formData.risk}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Danger</span>
                <input
                  readOnly
                  className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                  value={formData.danger}
                />
              </label>

              <label className="col-span-1 md:col-span-2 space-y-2">
                <span className="text-sm font-medium text-slate-700">Prevensi</span>
                <textarea
                  className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
                  value={formData.prevensi}
                  onChange={(e) => handleChange("prevensi", e.target.value)}
                  placeholder="Prevensi"
                />
              </label>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditAsesmen(null);
                    resetForm();
                  }}
                  className="rounded-3xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Hapus Asesmen?</h2>
            <p className="mb-6 text-sm text-slate-600">Data yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAsesmen}
                className="rounded-3xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RekapitulasiAsesmen;

