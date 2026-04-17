import express from "express";
import userAuth from "../middleware/userauth.js";
import upload from "../middleware/uploadlaporanfoto.js";
import {
  listRuangKerja,
  buatRuangKerja,
  editRuangKerja,
  hapusRuangKerja,
  undangAnggotaRuangKerja,
  lihatAnggotaRuangKerja,
  keluarkanAnggotaRuangKerja,
  keluarDariRuangKerja,
  proxyLogoRuangKerja
} from "../controllers/ruangkerjacontroller.js";

const router = express.Router();

router.get("/list-ruangkerja", userAuth, listRuangKerja);
router.post("/buat-ruangkerja", userAuth, upload.single("file"), buatRuangKerja);
router.put("/edit-ruangkerja", userAuth, upload.single("file"), editRuangKerja);
router.delete("/hapus-ruangkerja", userAuth, hapusRuangKerja);

router.post("/undang", userAuth, undangAnggotaRuangKerja);      // ⬅ untuk multiple email
router.get("/anggota", userAuth, lihatAnggotaRuangKerja);        // ⬅ lihat semua anggota (owner & member)

router.delete("/keluarkan", userAuth, keluarkanAnggotaRuangKerja);
router.delete("/keluar-sendiri", userAuth, keluarDariRuangKerja);
router.get("/logo-proxy", userAuth, proxyLogoRuangKerja);

export default router;
