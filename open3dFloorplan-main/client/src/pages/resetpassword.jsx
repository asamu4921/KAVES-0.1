import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import kavesLogo from "../assets/kaves.png";

export default function ResetPassword() {
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch(`${backendURL}/api/auth/send-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
    if (data.success) setStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch(`${backendURL}/api/auth/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });


    const data = await res.json();
    setMessage(data.message);
    setLoading(false);

    if (data.success) setStep(3);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch(`${backendURL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMessage(data.message);
      return;
    }

    alert("Password berhasil diubah!");
    window.location.href = "/login";
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
              <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold">Reset Password</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                Pulihkan akun Anda
              </h1>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                Ikuti langkah di bawah untuk mengganti password dan kembali masuk ke akun Anda.
              </p>
            </div>

            <div className="space-y-5">
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <p className="text-center text-slate-600">
                    Masukkan email yang terdaftar. Kami akan mengirimkan kode verifikasi.
                  </p>
                  <input
                    type="email"
                    placeholder="Email atau nomor ponsel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm sm:text-base text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/login")}
                      className="w-full sm:w-1/2 rounded-2xl bg-slate-200 py-4 text-sm font-medium text-slate-700 hover:bg-slate-300 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-1/2 rounded-2xl bg-green-600 py-4 text-sm font-semibold text-white hover:bg-green-700 transition"
                    >
                      {loading ? "Mengirim..." : "Kirim kode"}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <p className="text-center text-slate-600">
                    Kami telah mengirimkan kode OTP ke <span className="font-semibold">{email}</span>.
                  </p>
                  <input
                    type="text"
                    placeholder="Masukkan kode OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-lg tracking-[0.35em] text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-sm font-medium text-green-600 hover:text-green-800"
                  >
                    Kirim ulang kode
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/login")}
                      className="w-full sm:w-1/2 rounded-2xl bg-slate-200 py-4 text-sm font-medium text-slate-700 hover:bg-slate-300 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-1/2 rounded-2xl bg-green-600 py-4 text-sm font-semibold text-white hover:bg-green-700 transition"
                    >
                      {loading ? "Memverifikasi..." : "Lanjutkan"}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <p className="text-center text-slate-600">
                    Buat password baru yang kuat untuk akun Anda.
                  </p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-green-600 py-4 text-sm font-semibold text-white hover:bg-green-700 transition"
                  >
                    {loading ? "Menyimpan..." : "Ubah Password"}
                  </button>
                </form>
              )}
            </div>

            {message && (
              <p className="text-center text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
