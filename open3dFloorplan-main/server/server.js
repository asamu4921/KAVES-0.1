import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authroutes.js";
import userRouter from "./routes/userroutes.js";
import ruangKerjaRoutes from "./routes/ruangkerjaroutes.js";
import bangunanRoutes from "./routes/bangunanroutes.js";
import asesmenRoutes from "./routes/asesmenroutes.js";
import laporanKecelakaanRoutes from "./routes/laporankecelakaanroutes.js";
import projectRoutes from "./routes/projectroutes.js";

const app = express();
const port = process.env.PORT || 5454;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
// server.js (Backend Project)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4000", "http://localhost:5000"],
  credentials: true
}));
app.use("/api/projects", projectRoutes);

// Routes
app.get('/', (req, res) => res.send("API Working ✅"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use("/api/ruangkerja", ruangKerjaRoutes);
app.use("/api/bangunan", bangunanRoutes);
app.use("/api/asesmen", asesmenRoutes);
app.use("/api/laporankecelakaan", laporanKecelakaanRoutes);
app.use("/uploads", express.static("uploads"));

// Start server
app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
