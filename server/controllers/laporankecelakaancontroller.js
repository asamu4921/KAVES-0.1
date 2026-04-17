import mongoose from "mongoose";
import LaporanKecelakaan from "../models/laporankecelakaan.js";
import RuangKerja from "../models/ruangkerja.js";
import User from "../models/usermodel.js";
import { uploadFile, deleteFile } from "../services/uploadcareService.js";

const getUploadedFile = (req) => {
  if (req.file) return req.file;
  if (!req.files) return null;
  return req.files.file?.[0] || req.files.foto?.[0] || null;
};

/**
 * GET /api/laporankecelakaan/list?ruangkerja_id=...
 * Owner + anggota bisa melihat laporan
 */
export const listLaporan = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;

    if (!ruangkerja_id || !mongoose.Types.ObjectId.isValid(ruangkerja_id)) {
      return res.status(400).json({ success: false, message: "Ruang kerja ID tidak valid" });
    }

    const laporan = await LaporanKecelakaan.find({
      ruangkerja_id,
      tanggal_dihapus: null,
    }).sort({ waktu_tanggal: -1 });

    return res.json({ success: true, data: laporan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/laporankecelakaan/tambah?ruangkerja_id=...
 * Owner + anggota boleh membuat (darurat)
 */
export const tambahLaporan = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;
    const userId = req.user.id;
    const uploadedFile = getUploadedFile(req);

    if (!ruangkerja_id || !mongoose.Types.ObjectId.isValid(ruangkerja_id)) {
      return res.status(400).json({
        success: false,
        message: "Ruang kerja ID tidak valid",
      });
    }

    if (!uploadedFile || !req.body.deskripsi_kejadian) {
      return res.status(400).json({
        success: false,
        message: "Foto dan deskripsi kejadian wajib diisi",
      });
    }

    const ruang = await RuangKerja.findById(ruangkerja_id);
    if (!ruang) {
      return res.status(404).json({
        success: false,
        message: "Ruang kerja tidak ditemukan",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const { fileId, cdnUrl } = await uploadFile(uploadedFile.buffer, uploadedFile.originalname);

    const laporan = await LaporanKecelakaan.create({
      ruangkerja_id,
      nama_pelapor: user.name,
      foto: cdnUrl,
      fotoFileId: fileId,
      deskripsi_kejadian: req.body.deskripsi_kejadian,
      lokasi: req.body.lokasi || null,
      penyebab: req.body.penyebab || null,
      tingkat_resiko: req.body.tingkat_resiko || null,
      jenis_cedera: req.body.jenis_cedera || null,
      pertolongan_pertama: req.body.pertolongan_pertama || null,
      nama_petugas: req.body.nama_petugas || null,
      pencegahan_ke_depan: req.body.pencegahan_ke_depan || null,
    });

    return res.status(201).json({
      success: true,
      message: "Laporan kecelakaan berhasil dibuat",
      data: laporan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/laporankecelakaan/edit?laporan_id=...
 * Owner + anggota boleh melengkapi laporan
 */
export const editLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.query;
    const uploadedFile = getUploadedFile(req);

    if (!laporan_id || !mongoose.Types.ObjectId.isValid(laporan_id)) {
      return res.status(400).json({
        success: false,
        message: "Laporan ID tidak valid",
      });
    }

    const laporan = await LaporanKecelakaan.findById(laporan_id);
    if (!laporan || laporan.tanggal_dihapus) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan",
      });
    }

    if (uploadedFile) {
      const oldFileId = laporan.fotoFileId;

      // ✅ upload dulu
      const { fileId, cdnUrl } = await uploadFile(
        uploadedFile.buffer,
        uploadedFile.originalname
      );

      laporan.foto = cdnUrl;
      laporan.fotoFileId = fileId;

      // ✅ delete lama setelah upload sukses
      if (oldFileId) {
        try {
          console.log("Deleting old file:", oldFileId);
          await deleteFile(oldFileId);
        } catch (err) {
          console.error("Gagal hapus foto lama:", err.message);
        }
      }
    }

    const allowedFields = [
      "deskripsi_kejadian",
      "lokasi",
      "penyebab",
      "jenis_cedera",
      "pertolongan_pertama",
      "nama_petugas",
      "status_laporan",
      "pencegahan_ke_depan",
      "tingkat_resiko",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        laporan[field] = req.body[field];
      }
    });

    laporan.tanggal_diedit = new Date();
    await laporan.save();

    return res.json({
      success: true,
      message: "Laporan berhasil diperbarui",
      data: laporan,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE /api/laporankecelakaan/hapus?laporan_id=...
 * Soft delete. Hanya owner workspace
 */
export const hapusLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.query;
    const userId = req.user.id;

    if (!laporan_id || !mongoose.Types.ObjectId.isValid(laporan_id)) {
      return res.status(400).json({ success: false, message: "Laporan ID tidak valid" });
    }

    const laporan = await LaporanKecelakaan.findById(laporan_id);
    if (!laporan) {
      return res.status(404).json({ success: false, message: "Laporan tidak ditemukan" });
    }

    const ruang = await RuangKerja.findById(laporan.ruangkerja_id);
    const isOwner = String(ruang.pengguna_id) === String(userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Hanya owner yang boleh menghapus laporan" });
    }

    if (laporan.fotoFileId) {
      try {
        console.log("Deleting laporan photo:", laporan.fotoFileId);
        await deleteFile(laporan.fotoFileId);
      } catch (err) {
        console.error("Gagal hapus foto laporan:", err.message);
      }
    }

    laporan.tanggal_dihapus = new Date();
    await laporan.save();

    return res.json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
