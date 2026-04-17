import express from 'express'
import userAuth from '../middleware/userauth.js';
import upload from '../middleware/uploadlaporanfoto.js';
import { getUserData, uploadPhoto, updateProfile, deleteUser } from '../controllers/usercontroller.js';
import userModel from "../models/usermodel.js"; // penting

const userRouter = express.Router();
userRouter.get('/me', userAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });

    const user = await userModel.findById(userId);
    if (!user) {
      // Token can outlive user record (e.g., DB reset). Clear stale auth cookie.
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      });
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        photoFileId: user.photoFileId,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

userRouter.post('/upload-photo', userAuth, upload.single('file'), uploadPhoto);
userRouter.put('/update-profile', userAuth, upload.single('file'), updateProfile);
userRouter.delete('/delete-account', userAuth, deleteUser);
userRouter.get('/data', userAuth, getUserData);

export default userRouter;
