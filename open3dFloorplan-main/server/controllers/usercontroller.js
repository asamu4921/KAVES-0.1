import userModel from "../models/usermodel.js";
import { uploadFile, deleteFile } from "../services/uploadcareService.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        photo: user.photo,
        photoFileId: user.photoFileId,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File image harus dikirim dengan key file',
      });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldFileId = user.photoFileId;

    // ✅ upload dulu
    const { fileId, cdnUrl } = await uploadFile(
      req.file.buffer,
      req.file.originalname
    );

    user.photo = cdnUrl;
    user.photoFileId = fileId;
    await user.save();

    // ✅ delete lama (tidak ganggu response)
    if (oldFileId) {
      try {
        console.log("Deleting old file:", oldFileId);
        await deleteFile(oldFileId);
      } catch (err) {
        console.error("Gagal hapus file lama:", err.message);
      }
    }

    res.json({
      success: true,
      message: 'Foto berhasil diunggah ke Uploadcare',
      data: {
        photoUrl: cdnUrl,
        photoFileId: fileId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, removePhoto } = req.body;

    if (name && name.trim() !== '') {
      user.name = name.trim();
    }

    let oldFileId = user.photoFileId;

    // ✅ CASE 1: upload foto baru
    if (req.file) {
      const { fileId, cdnUrl } = await uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      user.photo = cdnUrl;
      user.photoFileId = fileId;
    }

    // ✅ CASE 2: hapus foto
    else if (removePhoto === 'true' || removePhoto === true) {
      user.photo = null;
      user.photoFileId = null;
    }

    await user.save();

    // ✅ delete file lama (setelah save sukses)
    if (oldFileId && oldFileId !== user.photoFileId) {
      try {
        console.log("Deleting old file:", oldFileId);
        await deleteFile(oldFileId);
      } catch (err) {
        console.error("Gagal hapus file lama:", err.message);
      }
    }

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        name: user.name,
        photo: user.photo,
        photoFileId: user.photoFileId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const fileId = user.photoFileId;

    await userModel.findByIdAndDelete(req.user.id);

    // ✅ delete foto setelah user dihapus
    if (fileId) {
      try {
        console.log("Deleting user photo:", fileId);
        await deleteFile(fileId);
      } catch (err) {
        console.error("Gagal hapus foto user:", err.message);
      }
    }

    res.json({
      success: true,
      message: 'User berhasil dihapus beserta photo Uploadcare',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
