import mongoose from "mongoose";

const bangunanSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  ruangkerja_id: { type: mongoose.Schema.Types.ObjectId, ref: "RuangKerja", required: true },
  tanggal_dibuat: { type: Date, default: Date.now },
  tanggal_diedit: { type: Date },
  tanggal_dihapus: { type: Date },
});

export default mongoose.model("Bangunan", bangunanSchema);
