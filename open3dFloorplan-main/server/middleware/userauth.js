import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {

  // 🔥 ambil dari cookie ATAU header
  let token = req.cookies?.token;

  // kalau tidak ada cookie → cek Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // kalau masih tidak ada
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode.id) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    req.user = { id: tokenDecode.id };
    next();

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;