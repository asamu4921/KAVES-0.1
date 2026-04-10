import mongoose from "mongoose";

const anggotaRuangKerjaSchema = new mongoose.Schema({
  ruangkerja_id: { type: mongoose.Schema.Types.ObjectId, ref: "RuangKerja", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["diundang", "diterima", "ditolak"],
    default: "diundang"
  },
  tanggal_diundang: { type: Date, default: Date.now },
  tanggal_respon: { type: Date }
});

export default mongoose.model("AnggotaRuangKerja", anggotaRuangKerjaSchema);
