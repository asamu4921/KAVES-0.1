import Bangunan from "../models/bangunan.js";
import RuangKerja from "../models/ruangkerja.js";
import mongoose from "mongoose";
import AnggotaRuangKerja from "../models/anggotaruangkerja.js";

/**
 * GET /api/bangunan/list?ruangkerja_id=...
 * Owner + anggota bisa melihat bangunan
 */
export const listBangunan = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(ruangkerja_id)) {
      return res.status(400).json({ success: false });
    }

    const ruang = await RuangKerja.findById(ruangkerja_id);
    if (!ruang) {
      return res.status(404).json({ success: false });
    }

    const isOwner = ruang.pengguna_id.toString() === userId.toString();

    const anggota = await AnggotaRuangKerja.findOne({
      ruangkerja_id,
      user_id: userId,
      status: "diundang" // atau "aktif"
    });

    const isMember = !!anggota;

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses ke workspace ini"
      });
    }

    const bangunan = await Bangunan.find({
      ruangkerja_id,
      tanggal_dihapus: { $exists: false }
    });

    return res.json({ success: true, data: bangunan });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};




/**
 * POST /api/bangunan/buat?ruangkerja_id=...
 * hanya owner boleh membuat bangunan
 */
export const buatBangunan = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;
    const { nama } = req.body;
    const userId = req.user.id;

    if (!ruangkerja_id || !mongoose.Types.ObjectId.isValid(ruangkerja_id)) {
      return res.status(400).json({ success: false, message: "Ruang kerja ID tidak valid" });
    }

    if (!nama || nama.trim() === "") {
      return res.status(400).json({ success: false, message: "Nama bangunan wajib diisi" });
    }

    const ruang = await RuangKerja.findById(ruangkerja_id);
    if (!ruang) {
      return res.status(404).json({ success: false, message: "Ruang kerja tidak ditemukan" });
    }

    const isOwner = String(ruang.pengguna_id) === String(userId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Hanya owner yang boleh membuat bangunan" });
    }

    const bangunan = await Bangunan.create({
      nama,
      ruangkerja_id
    });

    return res.status(201).json({
      success: true,
      message: "Bangunan berhasil dibuat",
      data: bangunan
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



/**
 * PUT /api/bangunan/edit?bangunan_id=...
 * Hanya owner workspace boleh edit bangunan
 */
export const editBangunan = async (req, res) => {
  try {
    const { bangunan_id } = req.query;
    const { nama } = req.body;
    const userId = req.user.id;

    if (!bangunan_id || !mongoose.Types.ObjectId.isValid(bangunan_id)) {
      return res.status(400).json({ success: false, message: "Bangunan ID tidak valid" });
    }

    const bangunan = await Bangunan.findById(bangunan_id);
    if (!bangunan) {
      return res.status(404).json({ success: false, message: "Bangunan tidak ditemukan" });
    }

    const ruang = await RuangKerja.findById(bangunan.ruangkerja_id);
    const isOwner = String(ruang.pengguna_id) === String(userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Hanya owner yang boleh mengedit bangunan" });
    }

    bangunan.nama = nama ?? bangunan.nama;
    bangunan.tanggal_diedit = new Date();
    await bangunan.save();

    return res.json({
      success: true,
      message: "Bangunan berhasil diperbarui",
      data: bangunan
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



/**
 * DELETE /api/bangunan/hapus?bangunan_id=...
 * Soft delete. Hanya owner workspace boleh hapus.
 */
export const hapusBangunan = async (req, res) => {
  try {
    const { bangunan_id } = req.query;
    const userId = req.user.id;

    if (!bangunan_id || !mongoose.Types.ObjectId.isValid(bangunan_id)) {
      return res.status(400).json({ success: false, message: "Bangunan ID tidak valid" });
    }

    const bangunan = await Bangunan.findById(bangunan_id);
    if (!bangunan) {
      return res.status(404).json({ success: false, message: "Bangunan tidak ditemukan" });
    }

    const ruang = await RuangKerja.findById(bangunan.ruangkerja_id);
    const isOwner = String(ruang.pengguna_id) === String(userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Hanya owner yang boleh menghapus bangunan" });
    }

    bangunan.tanggal_dihapus = new Date();
    await bangunan.save();

    return res.json({
      success: true,
      message: "Bangunan berhasil dihapus"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
