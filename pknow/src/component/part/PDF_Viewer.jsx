import React, { useState, useEffect } from "react";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker, Viewer } from "@react-pdf-viewer/core";

// Import CSS
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
// Hapus import CSS kustom jika tidak diperlukan lagi
import "../../style/PDF_Viewer.css"; 

import Loading from "./Loading";
import { API_LINK } from "../util/Constants";

export default function PDF_Viewer({
  pdfFileName,
  // Berikan nilai default yang pasti, bukan "auto"
  height = "750px", 
  width = "100%", // Default ke 100% agar responsif
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  // isLoading bisa kita sederhanakan, karena viewer punya loading spinner sendiri
  // const [isLoading, setIsLoading] = useState(false); 

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (pdfFileName) {
      const fileUrl = `${API_LINK}Upload/GetFile/${pdfFileName}`;
      setPdfUrl(fileUrl);
    } else {
      // Kosongkan URL jika tidak ada file, untuk handle kasus reset
      setPdfUrl(null);
    }
  }, [pdfFileName]);

  // Jika tidak ada URL, tampilkan pesan atau jangan render apapun
  if (!pdfUrl) {
    return <div style={{ height: height }}>Silakan pilih file PDF untuk ditampilkan.</div>;
  }

  return (
    // Worker harus membungkus Viewer
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
      {/* 
        Ini adalah container yang akan menjadi 'bingkai'.
        Kita beri tinggi yang pasti (fixed height) dan overflow: hidden 
        agar scrollbar internal Viewer yang bekerja.
      */}
      <div
        style={{
          height: height,
          width: width,
          border: '1px solid rgba(0, 0, 0, 0.3)', // Opsional: beri border agar terlihat rapi
          borderRadius: '4px', // Opsional: samakan dengan style lain
          overflow: 'hidden' // Penting untuk 'mengurung' viewer
        }}
      >
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          // Tampilkan loading spinner bawaan viewer
          renderLoader={(percentages) => (
            <div style={{ width: '240px' }}>
              <Loading message={`Loading... ${Math.round(percentages)}%`} />
            </div>
          )}
        />
      </div>
    </Worker>
  );
} 