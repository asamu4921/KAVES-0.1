import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  // Tambahkan ini agar sinkron dengan model bangunan.js
  ruangkerja_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RuangKerja",
    required: true
  },
  projectId: {
    type: String,
    required: true,
  },
  name: String,
  data: {
    type: Object, // simpan JSON full OpenPlan3D
    required: true,
  },
  thumbnail: String, // base64
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);