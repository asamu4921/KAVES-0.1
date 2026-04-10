import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import kavesLogo from "../assets/kaves.png";

export default function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.register || false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = isRegister
      ? `${backendURL}/api/auth/register`
      : `${backendURL}/api/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);

      if (!data.success) return;
      
      if (data.success) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_email", data.email);
      }

      // REGISTER → langsung ke verifikasi email
      if (isRegister) {
        window.location.href = "/email-verify";
        return;
      }

      // LOGIN → backend sudah kasih redirect yang benar
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      // fallback kalau backend lupa ngirim redirect
      window.location.href = "/home";
    } catch (err) {
      setMessage("Terjadi kesalahan, silakan coba lagi");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-100 flex items-center justify-center px-4 py-8 relative">
      <div className="md:hidden absolute top-4 left-4 z-20">
        <img src={kavesLogo} alt="KAVES Logo" className="w-12 h-12" />
      </div>

      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[32px] overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 bg-[url('/loginhero.svg')] bg-cover bg-center" />
        <div className="w-full md:w-1/2 p-8 sm:p-10">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold">Selamat datang</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                {isRegister ? "Daftar" : "Login"}
              </h1>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                Masuk untuk melanjutkan ke dashboard atau buat akun baru jika belum punya.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <input
                  type="text"
                  name="name"
                  placeholder="Nama"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm sm:text-base text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm sm:text-base text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Kata sandi"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-14 text-sm sm:text-base text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isRegister && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm font-medium text-green-700 hover:text-green-900"
                    onClick={() => (window.location.href = "/reset-password")}
                  >
                    Lupa password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-green-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-green-700"
              >
                {isRegister ? "Daftar" : "Login"}
              </button>

              <p
                onClick={() => setIsRegister(!isRegister)}
                className="text-center text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {isRegister
                  ? "Sudah punya akun? Login"
                  : "Belum punya akun? Daftar"}
              </p>

              {message && (
                <p className="text-center text-sm text-slate-700 bg-emerald-50 px-4 py-3 rounded-2xl">
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
