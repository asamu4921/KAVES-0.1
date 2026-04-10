import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("✅ MongoDB Connected"));
    mongoose.connection.on('error', (err) => console.error("❌ MongoDB Connection Error:", err));

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
