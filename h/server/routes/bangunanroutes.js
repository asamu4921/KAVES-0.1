import express from "express";
import userAuth from "../middleware/userauth.js";
import {
  listBangunan,
  buatBangunan,
  editBangunan,
  hapusBangunan,
} from "../controllers/bangunancontroller.js";

const router = express.Router();

// GET list bangunan
router.get("/list", userAuth, listBangunan);

// POST buat bangunan
router.post("/buat", userAuth, buatBangunan);

// PUT edit bangunan
router.put("/edit", userAuth, editBangunan);

// DELETE hapus bangunan
router.delete("/hapus", userAuth, hapusBangunan);

export default router;
