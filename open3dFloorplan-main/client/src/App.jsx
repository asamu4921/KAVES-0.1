import { useState, useContext } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AppContext } from "./context/AppContext.jsx";
import Login from "./pages/login";
import EmailVerify from "./pages/emailverify";
import Home from "./pages/home";
import ResetPassword from "./pages/resetpassword";
import Welcome from "./pages/welcome";

import kavesLogo from "./assets/kaves.png";
import proyekImg from "./assets/pana.png";
import orangImg from "./assets/bro.png";
import clipboardImg from "./assets/clipboard.png";
import mapImg from "./assets/map.png";
import gridImg from "./assets/grid.png";
import footerLogo from "./assets/kavesfooter.png";
import social1 from "./assets/social.png";
import social2 from "./assets/social (1).png";
import social3 from "./assets/social (2).png";
import vector from "./assets/vector.png";
import loc from "./assets/loc.png";

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <nav className="flex justify-between items-center max-w-9xl mx-auto py-4 px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={kavesLogo} alt="KAVES Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-green-700">KAVES</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <li><a href="#home" className="hover:text-green-600">Beranda</a></li>
            <li><a href="#tentang" className="hover:text-green-600">Tentang</a></li>
            <li><a href="#fitur" className="hover:text-green-600">Fitur</a></li>
            <li><a href="#langganan" className="hover:text-green-600">Langganan</a></li>
            <li><a href="#kontak" className="hover:text-green-600">Kontak</a></li>
            <li>
              <Link
                to="/login"
                state={{ register: true }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Daftar
              </Link>
            </li>

            <li>
              <Link
                to="/login"
                className="border border-green-600 text-green-600 px-4 py-2 rounded hover:shadow-sm hover:shadow-xl transition-shadow duration-300 transition"
              >
                Masuk
              </Link>
            </li>
          </ul>

          {/* Mobile Burger */}
          <button
            className="md:hidden text-green-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-3">
            <a href="#home" className="block text-gray-700 hover:text-green-600">Beranda</a>
            <a href="#tentang" className="block text-gray-700 hover:text-green-600">Tentang</a>
            <a href="#fitur" className="block text-gray-700 hover:text-green-600">Fitur</a>
            <a href="#langganan" className="block text-gray-700 hover:text-green-600">Langganan</a>
            <a href="#kontak" className="block text-gray-700 hover:text-green-600">Kontak</a>
            <Link
              to="/login"
              state={{ register: true }}
              className="w-full block bg-green-600 text-white py-2 rounded text-center hover:bg-green-700 transition"
            >
              Daftar
            </Link>

            <Link
              to="/login"
              className="block text-center border border-green-600 text-green-600 py-2 rounded hover:bg-green-600 hover:text-white transition"
            >
              Masuk
            </Link>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section
        id="home"
        className="pt-24 bg-gradient-to-r from-green-50 to-white min-h-screen flex flex-col justify-center"
      >
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between px-6 gap-12">
          {/* Text */}
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-green-700">KAVES</h1>
            <p className="text-lg text-gray-600">
              Pantau dan kelola aktivitas lingkungan kerja dengan mudah. Satu
              platform untuk produktivitas tanpa batas.
            </p>
            <a
              href="#langganan"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Lebih Lanjut
            </a>
          </div>

          {/* Image */}
          <div className="md:w-1/2">
            <img
              src={proyekImg}
              alt="KAVES Illustration"
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="tentang" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-3xl font-bold text-green-700">Apa Itu Kaves?</h2>
          <p className="text-gray-600 leading-relaxed">
            Aplikasi pembantu staff dan kepala K3 dalam mengelola aktivitas
            keselamatan kerja secara efisien. Mulai dari pencatatan laporan
            aktivitas harian, pemetaan otomatis area berisiko, hingga manajemen
            laporan kecelakaan dan asesmen dokumen hazard. Dengan KAVES, proses
            administrasi K3 menjadi lebih cepat, akurat, dan transparan.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="fitur" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img
              src={orangImg}
              alt="Fitur Kaves"
            />
          </div>

          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-green-700">
              Fitur Unggulan Kaves
            </h2>

            <div className="space-y-4">
              {[
                { img: clipboardImg, text: "Formulir Hazard Otomatis" },
                { img: mapImg, text: "Safety Mapping" },
                { img: gridImg, text: "Manajemen Laporan Kecelakaan" },
                { img: gridImg, text: "Ruang Kerja Eksklusif" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white shadow p-3 rounded-lg hover:shadow-md transition"
                >
                  <img src={item.img} alt={item.text} className="w-10 h-10" />
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="langganan" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-green-700">
            Mulai Paket Premium
          </h2>
          <p className="text-gray-600 mb-12">
            Nikmati akses tak terbatas untuk memperluas jangkauan dan
            produktivitas Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gratis */}
            <div className="border rounded-2xl p-8 shadow hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-green-700">Gratis</h3>
              <p className="text-3xl font-bold my-4">Rp 0</p>
              <ul className="text-gray-600 space-y-2">
                <li>15 Anggota</li>
                <li>100 Asesmen</li>
                <li>100 Laporan</li>
                <li>2 Proyek Layout</li>
              </ul>
              <button className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Pilih Paket
              </button>
            </div>

            {/* Premium */}
            <div className="border-2 border-green-600 rounded-2xl p-8 bg-green-50 shadow hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-green-700">Premium</h3>
              <p className="text-3xl font-bold my-4">Rp 300 / Bulan</p>
              <ul className="text-gray-700 space-y-2">
                <li>Anggota tak terbatas</li>
                <li>Asesmen tanpa batas</li>
                <li>Laporan tanpa batas</li>
                <li>Proyek Layout tanpa batas</li>
              </ul>
              <button className="mt-6 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition">
                Pilih Paket
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="kontak" className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">
          <div>
            <img src={footerLogo} alt="KAVES Footer Logo" className="w-24 mb-3" />
            <h4 className="font-bold text-lg">PT. KAVES INDONESIA</h4>
            <p>K3L Safety System</p>
            <p className="mt-2 text-sm">KAVES – Your Safety, Our Priority</p>
          </div>

          <div>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-green-300">Beranda</a></li>
              <li><a href="#tentang" className="hover:text-green-300">Tentang</a></li>
              <li><a href="#fitur" className="hover:text-green-300">Fitur</a></li>
              <li><a href="#langganan" className="hover:text-green-300">Langganan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            {[social1, social2, social3].map((sos, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <img src={sos} alt={`social${i}`} className="w-6 h-6" />
                <a href="#" className="hover:text-green-300">@smart__hse</a>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold mb-3">Alamat</h4>
            <div className="flex items-start gap-3 mb-2">
              <img src={vector} alt="phone" className="w-5 h-5 mt-1" />
              <span>+62 812 3456 7890</span>
            </div>
            <div className="flex items-start gap-3">
              <img src={loc} alt="location" className="w-5 h-5 mt-1" />
              <span>Jl. Ahmad Yani, Kota Batam, Kepulauan Riau</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AppContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/email-verify" element={
        <ProtectedRoute>
          <EmailVerify />
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/welcome" element={
        <ProtectedRoute>
          <Welcome />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;

