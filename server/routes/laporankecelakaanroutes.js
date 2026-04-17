import express from "express";
import userAuth from "../middleware/userauth.js";
import upload from "../middleware/uploadlaporanfoto.js";
import {
  listLaporan,
  tambahLaporan,
  editLaporan,
  hapusLaporan,
} from "../controllers/laporankecelakaancontroller.js";

const router = express.Router();

// LIST
router.get("/list", userAuth, listLaporan);

// TAMBAH (pakai upload foto)
router.post(
  "/tambah",
  userAuth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  tambahLaporan
);

// EDIT (HARUS lewat multer juga)
router.put(
  "/edit",
  userAuth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]), // menerima key file lama dan baru
  editLaporan
);

// HAPUS
router.delete("/hapus", userAuth, hapusLaporan);

export default router;
