
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import { sendEmail } from "../config/nodemailer.js";
import RuangKerja from '../models/ruangkerja.js';
import AnggotaRuangKerja from '../models/anggotaruangkerja.js';

// REGISTER
// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat OTP dulu
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Buat user baru
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
    });

    await user.save();

    // Buat JWT token (langsung login)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie token (biar bisa langsung verify OTP)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Kirim OTP ke email
    try {
  await sendEmail({
    to: email,
    subject: "Verify your KAVES account",
    text: `Your verification OTP is: ${otp}`,
  });
} catch (err) {
  console.error("EMAIL FAILED:", err.message);
  // jangan throw, jangan return
}



    return res.json({
      success: true,
      redirect: '/email-verify',
      message: 'Registered successfully. OTP sent to email.',
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // jika belum diverifikasi
    if (!user.isAccountVerified) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Verify your KAVES account",
        text: `Your verification OTP is: ${otp}`,
      });




      return res.json({
        success: true,
        redirect: '/email-verify',
        message: 'OTP sent again. Please verify your email.',
      });
    }

    // -------------------------------------------
    //  CEK WORKSPACE DI SINI, BUKAN DI REGISTER
    // -------------------------------------------
    const workspaceOwned = await RuangKerja.findOne({ pengguna_id: user._id });
    const workspaceMember = await AnggotaRuangKerja.findOne({ user_id: user._id });

    if (!workspaceOwned && !workspaceMember) {
      return res.json({
        success: true,
        redirect: "/welcome",
        message: "Login successful, please create your first workspace or join to other !"
      });
    }

    return res.json({
      success: true,
      redirect: "/home",
      message: "Login successful"
    });


  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
    return res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// KIRIM ULANG OTP
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id; // dari token, bukan body
    const user = await userModel.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Verify your KAVES account",
      text: `Your verification OTP is: ${otp}. Verify your account using this OTP.`,
    });


    return res.json({ success: true, message: "OTP sent again to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// VERIFIKASI EMAIL
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id; // ambil dari userAuth

  if (!otp) {
    return res.json({ success: false, message: "Missing OTP" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// CEK LOGIN STATUS
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // berlaku 15 menit
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. Use this OTP within 15 minutes to reset your password.`,
    };

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. Use this OTP within 15 minutes.`,
    });

    return res.json({ success: true, message: 'OTP sent to your email' }).catch(console.error);

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: 'Password has been reset successfully' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    if (user.resetOtp !== otp) return res.json({ success: false, message: 'Invalid OTP' });
    if (user.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: 'OTP expired' });

    return res.json({ success: true, message: 'OTP verified' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};




