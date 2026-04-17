import mongoose from "mongoose";

const asesmenSchema = new mongoose.Schema({
  bangunan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bangunan",
    required: true
  },
  nomor_surat: String,
  tugas: String,
  lokasi: String,
  peralatan: String,
  jenis_pekerjaan: String,
  jenis_bahaya: String,
  cause_effect: String,
  likelihood: Number,
  severity: Number,
  risk: Number,
  level: String,
  impact: String,
  danger: String,
  prevensi: String,
  dibuat_oleh: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
  },
  disetujui_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  tanggal_disetujui: Date,
  tanggal_dibuat: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Asesmen", asesmenSchema);
