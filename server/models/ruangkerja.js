import mongoose from "mongoose";

const ruangKerjaSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  pengguna_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  logo_url: { type: String, maxlength: 500 },
  logo_file_id: { type: String, maxlength: 255, default: null },
  
  tanggal_dibuat: { type: Date, default: Date.now },
  tanggal_diedit: { type: Date },
  tanggal_dihapus: { type: Date }
});

export default mongoose.model("RuangKerja", ruangKerjaSchema);
