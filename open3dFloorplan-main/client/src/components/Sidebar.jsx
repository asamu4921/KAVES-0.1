import React from "react";
import { BarChart2, FileText, ClipboardList, MapPin, Building2, Users, LayoutDashboard, ShieldAlert, LogOut } from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen, activePage, setActivePage }) {
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    try {
      const res = await fetch(`${backendURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert("Logout gagal: " + data.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Terjadi kesalahan saat logout.");
    }
  };

  const navItems = [
    { name: "Dashboard", icon: BarChart2 },
    { name: "Isi Asesmen", icon: FileText },
    { name: "Rekapitulasi Asesmen", icon: ClipboardList },
    { name: "Map", icon: MapPin },
    { name: "Gedung", icon: Building2 },
    { name: "Lihat Anggota", icon: Users },
    { name: "Ruang Kerja", icon: LayoutDashboard },
    { name: "Laporan Kecelakaan", icon: ShieldAlert },
  ];

  return (
    <aside
      className={`fixed z-20 bg-[#3A5B22] w-64 h-screen shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} 
        lg:translate-x-0 lg:static flex flex-col justify-between text-white`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="p-4 flex justify-between items-center border-b border-[#2e461a]">
          <h1 className="text-xl font-bold">KAVES</h1>
          <button
            className="lg:hidden text-gray-200 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✖
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200
                ${
                  activePage === item.name
                    ? "bg-[#FFC20E] text-black shadow-md"
                    : "hover:bg-[#4d742d]"
                }`}
            >
              <item.icon size={20} />
              <span className="text-lg">{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#2e461a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
