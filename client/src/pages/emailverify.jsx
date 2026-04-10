import { useState } from "react";
import kavesLogo from "../assets/kaves.png";

export default function EmailVerify() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${backendURL}/api/auth/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();
      setMessage(data.message);
      setLoading(false);

      if (!data.success) return;

      // setelah verifikasi cek workspace user
      const wsRes = await fetch(`${backendURL}/api/ruangkerja/list-ruangkerja`, {
        method: "GET",
        credentials: "include",
      });

      const wsData = await wsRes.json();

      if (wsData.success && wsData.data.length > 0) {
        // set workspace pertama sebagai aktif
        const ws = wsData.data[0];
        localStorage.setItem("workspace_aktif", ws._id);
        localStorage.setItem("workspace_aktif_nama", ws.nama);
        window.location.href = "/home";
      } else {
        // belum punya workspace
        window.location.href = "/welcome";
      }
    } catch {
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${backendURL}/api/auth/send-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      setMessage(data.message);
      setResendLoading(false);
    } catch {
      setMessage("Gagal mengirim ulang OTP.");
      setResendLoading(false);
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
              <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold">Verifikasi Akun</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                Masukkan Kode OTP
              </h1>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                Kode verifikasi telah dikirimkan ke email Anda. Masukkan kode untuk menyelesaikan aktivasi akun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-lg tracking-[0.35em] text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-sm font-medium text-green-600 hover:text-green-800"
              >
                {resendLoading ? "Mengirim ulang..." : "Kirim ulang kode"}
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

            {message && (
              <p className="text-center text-sm text-green-600 bg-green-50 px-4 py-3 rounded-2xl">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
