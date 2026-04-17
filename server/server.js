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
const staticAllowedOrigins = ["http://localhost:5173", "http://localhost:4000", "http://localhost:5000"];
const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const privateLanOriginRegex = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowList = [...staticAllowedOrigins, ...envAllowedOrigins];
    if (allowList.includes(origin) || privateLanOriginRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
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
