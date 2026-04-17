import Asesmen from "../models/asesmen.js";
import Bangunan from "../models/bangunan.js";
import RuangKerja from "../models/ruangkerja.js";
import AnggotaRuangKerja from "../models/anggotaruangkerja.js";
import mongoose from "mongoose";

/**
 * Helper: cek apakah user owner atau anggota di ruangkerja terkait
 */
const cekAksesKeRuang = async (ruangkerjaId, userId) => {
  const ruang = await RuangKerja.findById(ruangkerjaId);
  if (!ruang) return { exists: false };

  const isOwner = String(ruang.pengguna_id) === String(userId);
  const anggotaRecord = await AnggotaRuangKerja.findOne({
    ruangkerja_id: ruangkerjaId,
    user_id: userId
  });
  const isMember = !!anggotaRecord;
  return { exists: true, isOwner, isMember, ruang };
};

const hitungRiskDanDanger = (payload) => {
  const likelihood = Number(payload.likelihood) || 0;
  const severity = Number(payload.severity) || 0;
  const risk = likelihood * severity;

  return {
    ...payload,
    likelihood,
    severity,
    risk,
    danger:
      risk >= 17 ? "Katastropik" :
      risk >= 10 ? "High" :
      risk >= 5 ? "Medium" : "Low"
  };
};

/**
 * POST /api/asesmen/tambah?bangunan_id=...
 * Owner dan anggota boleh tambah
 */
export const tambahAsesmen = async (req, res) => {
  try {
    const { bangunan_id } = req.query;
    const userId = req.user?.id;

    if (!bangunan_id || !mongoose.Types.ObjectId.isValid(bangunan_id)) {
      return res.status(400).json({ success: false, message: "bangunan_id tidak valid" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bangunan = await Bangunan.findById(bangunan_id);
    if (!bangunan) {
      return res.status(404).json({ success: false, message: "Bangunan tidak ditemukan" });
    }

    const akses = await cekAksesKeRuang(bangunan.ruangkerja_id, userId);
    if (!akses.exists) return res.status(404).json({ success: false, message: "Ruang kerja tidak ditemukan" });

    if (!akses.isOwner && !akses.isMember) {
      return res.status(403).json({ success: false, message: "Tidak punya akses menambah asesmen di bangunan ini" });
    }

    const asesmen = await Asesmen.create({
      bangunan_id,
      ...hitungRiskDanDanger(req.body),
      dibuat_oleh: userId,
      disetujui_oleh: akses.ruang.pengguna_id,
      tanggal_disetujui: new Date(),
      tanggal_dibuat: new Date()
    });

    return res.json({ success: true, message: "Asesmen berhasil ditambahkan", data: asesmen });
  } catch (err) {
    console.error("tambahAsesmen:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * GET /api/asesmen/list?bangunan_id=...
 * Owner & anggota boleh lihat
 */
export const listAsesmen = async (req, res) => {
  try {
    const { bangunan_id } = req.query;
    if (!bangunan_id) {
      return res.status(400).json({ success: false, message: "bangunan_id diperlukan" });
    }

    // TAMBAHKAN .populate("dibuat_oleh", "name") 
    // agar field 'name' dari user diambil otomatis
    const data = await Asesmen.find({ bangunan_id })
      .populate("dibuat_oleh", "name")
      .populate("disetujui_oleh", "name")
      .sort({ tanggal_dibuat: -1 });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("listAsesmen:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * PUT /api/asesmen/edit?asesmen_id=...
 * Hanya owner workspace boleh edit
 */
export const editAsesmen = async (req, res) => {
  try {
    const { asesmen_id } = req.query;
    const userId = req.user?.id;

    if (!asesmen_id || !mongoose.Types.ObjectId.isValid(asesmen_id)) {
      return res.status(400).json({ success: false, message: "asesmen_id tidak valid" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const asesmen = await Asesmen.findById(asesmen_id);
    if (!asesmen) return res.status(404).json({ success: false, message: "Asesmen tidak ditemukan" });

    const bangunan = await Bangunan.findById(asesmen.bangunan_id);
    if (!bangunan) return res.status(404).json({ success: false, message: "Bangunan tidak ditemukan" });

    const akses = await cekAksesKeRuang(bangunan.ruangkerja_id, userId);

    if (!akses.exists) return res.status(404).json({ success: false, message: "Ruang kerja tidak ditemukan" });
    if (!akses.isOwner) return res.status(403).json({ success: false, message: "Hanya owner yang boleh edit asesmen" });

    const updatePayload = {
      ...hitungRiskDanDanger(req.body),
      disetujui_oleh: akses.ruang.pengguna_id,
      tanggal_disetujui: req.body.tanggal_disetujui || new Date()
    };

    const updated = await Asesmen.findByIdAndUpdate(asesmen_id, updatePayload, { new: true })
      .populate("dibuat_oleh", "name")
      .populate("disetujui_oleh", "name");
    return res.json({ success: true, message: "Asesmen berhasil diperbarui", data: updated });
  } catch (err) {
    console.error("editAsesmen:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * DELETE /api/asesmen/hapus?asesmen_id=...
 * Hanya owner workspace boleh hapus
 */
export const hapusAsesmen = async (req, res) => {
  try {
    const { asesmen_id } = req.query;
    const userId = req.user?.id;

    if (!asesmen_id || !mongoose.Types.ObjectId.isValid(asesmen_id)) {
      return res.status(400).json({ success: false, message: "asesmen_id tidak valid" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const asesmen = await Asesmen.findById(asesmen_id);
    if (!asesmen) return res.status(404).json({ success: false, message: "Asesmen tidak ditemukan" });

    const bangunan = await Bangunan.findById(asesmen.bangunan_id);
    const akses = await cekAksesKeRuang(bangunan.ruangkerja_id, userId);

    if (!akses.exists) return res.status(404).json({ success: false, message: "Ruang kerja tidak ditemukan" });
    if (!akses.isOwner) return res.status(403).json({ success: false, message: "Hanya owner yang boleh hapus asesmen" });

    await Asesmen.findByIdAndDelete(asesmen_id);
    return res.json({ success: true, message: "Asesmen berhasil dihapus" });
  } catch (err) {
    console.error("hapusAsesmen:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
