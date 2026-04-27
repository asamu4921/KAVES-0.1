import React, { useEffect, useRef, useState } from "react";

const Map = ({ workspaceId }) => {
  const [fullMode, setFullMode] = useState(false);
  const mapContainerRef = useRef(null);

  // Debugging: Cek di console browser (F12) apakah ID ini muncul atau null
  useEffect(() => {
    console.log("Current Workspace ID in Map:", workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullMode(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && mapContainerRef.current) {
        await mapContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Gagal mengubah mode fullscreen:", error);
    }
  };

  // URL floorplan bisa diatur lewat env agar fleksibel di local/VPS
  const floorplanBaseUrl = import.meta.env.VITE_FLOORPLAN_URL || "http://localhost:5000";
  const floorplanUrl = new URL(floorplanBaseUrl);
  floorplanUrl.searchParams.set("ruangkerja_id", workspaceId || "");
  const svelteUrl = floorplanUrl.toString();

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visualisasi 3D Floorplan</h1>
          <p className="text-sm text-slate-500">
            ID Ruang Kerja: <span className="font-mono text-blue-600">{workspaceId || "Belum Terpilih"}</span>
          </p>
        </div>

        {workspaceId && (
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {fullMode ? "Keluar Fullscreen" : "Fullscreen"}
          </button>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="relative flex-1 w-full min-h-[600px] bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200"
      >
        {!workspaceId ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10 text-center">
            <div className="mb-4 text-4xl">📍</div>
            <p className="font-semibold">Ruang Kerja Belum Dipilih</p>
            <p className="text-sm">Silakan pilih salah satu Ruang Kerja di sidebar atau Dashboard terlebih dahulu.</p>
          </div>
        ) : (
          <iframe
            key={workspaceId} // 'key' memaksa iframe reload saat ID berubah
            src={svelteUrl}
            title="Svelte 3D Floorplan"
            className="absolute top-0 left-0 w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default Map;