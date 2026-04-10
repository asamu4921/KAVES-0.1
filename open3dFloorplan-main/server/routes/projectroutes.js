import express from "express";
import userAuth from "../middleware/userauth.js";
import {
  saveProject,
  getProjects,
  getProjectById,
  deleteProject,
  saveThumbnail,
  getThumbnail
} from "../controllers/projectcontroller.js";

const router = express.Router();

router.post("/thumbnail/:id", userAuth, saveThumbnail);
router.get("/thumbnail/:id", userAuth, getThumbnail);

router.post("/save", userAuth, saveProject);
router.get("/", userAuth, getProjects);
router.get("/:id", userAuth, getProjectById);
router.delete("/:id", userAuth, deleteProject);

export default router;