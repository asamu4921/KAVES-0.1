import mongoose from "mongoose";

const laporanKecelakaanSchema = new mongoose.Schema({
  ruangkerja_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuangKerja",
    required: true,
  },

  // waktu kejadian
  waktu_tanggal: {
    type: Date,
    default: Date.now,
  },

  // lokasi kejadian (tetap string, jangan disiksa)
  lokasi: {
    type: String,
    default: null,
  },

  nama_pelapor: {
    type: String,
    required: true,
  },

  foto: {
    type: String,
    required: true,
  },

  fotoFileId: {
    type: String,
    required: true,
  },

  deskripsi_kejadian: {
    type: String,
    required: true,
  },

  penyebab: {
    type: String,
    default: null,
  },

  tingkat_resiko: {
    type: String,
    default: null,
  },

  jenis_cedera: {
    type: String,
    default: null,
  },

  pertolongan_pertama: {
    type: String,
    default: null,
  },

  nama_petugas: {
    type: String,
    default: null,
  },

  status_laporan: {
    type: String,
    default: "Dilaporkan",
  },

  pencegahan_ke_depan: {
    type: String,
    default: null,
  },

  // metadata waktu
  tanggal_diedit: {
    type: Date,
    default: null,
  },

  tanggal_dihapus: {
    type: Date,
    default: null,
  },
});

export default mongoose.model("LaporanKecelakaan", laporanKecelakaanSchema);
