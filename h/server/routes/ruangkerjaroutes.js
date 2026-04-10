import express from "express";
import userAuth from "../middleware/userauth.js";
import {
  listRuangKerja,
  buatRuangKerja,
  editRuangKerja,
  hapusRuangKerja,
  undangAnggotaRuangKerja,
  lihatAnggotaRuangKerja
} from "../controllers/ruangkerjacontroller.js";

const router = express.Router();

router.get("/list-ruangkerja", userAuth, listRuangKerja);
router.post("/buat-ruangkerja", userAuth, buatRuangKerja);
router.put("/edit-ruangkerja", userAuth, editRuangKerja);
router.delete("/hapus-ruangkerja", userAuth, hapusRuangKerja);

router.post("/undang", userAuth, undangAnggotaRuangKerja);      // ⬅ untuk multiple email
router.get("/anggota", userAuth, lihatAnggotaRuangKerja);        // ⬅ lihat semua anggota (owner & member)
import { keluarkanAnggotaRuangKerja } from "../controllers/ruangkerjacontroller.js";

router.delete("/keluarkan", userAuth, keluarkanAnggotaRuangKerja);

export default router;
