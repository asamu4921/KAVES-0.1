import RuangKerja from "../models/ruangkerja.js";
import userModel from '../models/usermodel.js';
import AnggotaRuangKerja from "../models/anggotaruangkerja.js";
// ✅ List ruang kerja milik user login
export const listRuangKerja = async (req, res) => {
  try {
    const userId = req.user.id; // DARI TOKEN AUTH MIDDLEWARE

    // Workspace yang di-OWN
    const owned = await RuangKerja.find({ pengguna_id: userId });

    // Workspace yang dia ikut sebagai MEMBER
    const memberRecords = await AnggotaRuangKerja.find({ user_id: userId });
    const memberWorkspaceIds = memberRecords.map(m => m.ruangkerja_id);
    const joined = await RuangKerja.find({ _id: { $in: memberWorkspaceIds } });

    const all = [...owned, ...joined];

    res.json({
      success: true,
      data: all
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ✅ Buat ruang kerja
export const buatRuangKerja = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) return res.json({ success: false, message: "Nama ruang kerja harus diisi" });

    const ruang = new RuangKerja({
      nama,
      pengguna_id: req.user.id  // <-- HARUS begini
    });


    await ruang.save();
    res.json({ success: true, message: "Ruang kerja berhasil dibuat", data: ruang });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Edit ruang kerja
export const editRuangKerja = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;
    const { nama } = req.body;

    if (!ruangkerja_id || !nama) {
      return res.json({ success: false, message: "ruangkerja_id & nama wajib diisi" });
    }

    const workspace = await RuangKerja.findOne({
      _id: ruangkerja_id,
      pengguna_id: req.user.id
    });

    if (!workspace) {
      return res.json({ success: false, message: "Anda bukan owner workspace ini" });
    }

    workspace.nama = nama;
    workspace.tanggal_diedit = new Date();
    await workspace.save();

    return res.json({ success: true, message: "Nama ruang kerja berhasil diupdate" });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


// ✅ Hapus ruang kerja (soft delete)
export const hapusRuangKerja = async (req, res) => {
  try {
    const { id } = req.body;

    await RuangKerja.findOneAndUpdate(
      { _id: id, pengguna_id: req.body.userId },
      { tanggal_dihapus: new Date() }
    );

    res.json({ success: true, message: "Ruang kerja berhasil dihapus" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const undangAnggotaRuangKerja = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;
    const { emails } = req.body;

    if (!ruangkerja_id || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.json({ success: false, message: "ruangkerja_id & emails wajib diisi" });
    }

    const ruang = await RuangKerja.findOne({
      _id: ruangkerja_id,
      pengguna_id: req.user.id
    });

    if (!ruang) {
      return res.json({ success: false, message: "Ruang kerja tidak ditemukan atau bukan milik Anda" });
    }

    const hasil = [];

    for (const email of emails) {
      const userTarget = await userModel.findOne({ email });
      if (!userTarget) {
        hasil.push({ email, status: "gagal", reason: "User belum terdaftar di KAVES" });
        continue;
      }

      const cekAnggota = await AnggotaRuangKerja.findOne({
        ruangkerja_id,
        user_id: userTarget._id
      });

      if (cekAnggota) {
        hasil.push({ email, status: "gagal", reason: "User sudah anggota" });
        continue;
      }

      await AnggotaRuangKerja.create({
        ruangkerja_id,
        user_id: userTarget._id
      });

      hasil.push({ email, status: "berhasil" });
    }

    res.json({ success: true, message: "Proses undang selesai", data: hasil });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
export const lihatAnggotaRuangKerja = async (req, res) => {
  try {
    const { ruangkerja_id } = req.query;

    if (!ruangkerja_id) {
      return res.json({ success: false, message: "ruangkerja_id wajib diisi" });
    }

    // cek apakah user owner atau member
    const aksesOwner = await RuangKerja.findOne({
      _id: ruangkerja_id,
      pengguna_id: req.user.id
    });

    const aksesMember = await AnggotaRuangKerja.findOne({
      ruangkerja_id,
      user_id: req.user.id
    });

    if (!aksesOwner && !aksesMember) {
      return res.json({
        success: false,
        message: "Anda tidak memiliki akses ke ruang kerja ini"
      });
    }

    // ambil semua anggota termasuk owner
    const ruang = await RuangKerja.findOne({ _id: ruangkerja_id });
    if (!ruang) return res.json({ success: false, message: "Ruang kerja tidak ditemukan" });

    const owner = await userModel.findOne({ _id: ruang.pengguna_id }).select("nama email");

    // ambil record anggota (yang disimpan di collection anggota) dan populate user info
    const anggotaList = await AnggotaRuangKerja.find({ ruangkerja_id })
      .populate("user_id", "nama email");

    // Kembalikan juga user_id untuk setiap entry supaya frontend bisa pake id saat remove
    const result = [
      {
        role: "owner",
        nama: owner.nama,
        email: owner.email,
        user_id: ruang.pengguna_id.toString()
      },
      ...anggotaList.map(a => ({
        role: "member",
        nama: a.user_id?.nama || "",
        email: a.user_id?.email || "",
        user_id: a.user_id?._id ? a.user_id._id.toString() : null,
        anggota_record_id: a._id.toString() // optional kalau mau pakai record id
      }))
    ];

    return res.json({ success: true, data: result });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const keluarkanAnggotaRuangKerja = async (req, res) => {
  try {
    const { ruangkerja_id, user_target } = req.query;

    if (!ruangkerja_id || !user_target) {
      return res.json({
        success: false,
        message: "ruangkerja_id & user_target wajib diisi"
      });
    }

    // cek apakah requester adalah owner
    const ruang = await RuangKerja.findOne({
      _id: ruangkerja_id,
      pengguna_id: req.user.id
    });

    if (!ruang) {
      return res.json({
        success: false,
        message: "Anda bukan owner workspace ini"
      });
    }

    // cegah owner mengeluarkan dirinya sendiri
    if (ruang.pengguna_id.toString() === user_target) {
      return res.json({
        success: false,
        message: "Owner tidak bisa mengeluarkan dirinya sendiri"
      });
    }

    // cek apakah target memang anggota
    const anggota = await AnggotaRuangKerja.findOne({
      ruangkerja_id,
      user_id: user_target
    });

    if (!anggota) {
      return res.json({
        success: false,
        message: "User bukan anggota workspace"
      });
    }

    await AnggotaRuangKerja.deleteOne({ _id: anggota._id });

    return res.json({
      success: true,
      message: "Anggota berhasil dikeluarkan"
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
