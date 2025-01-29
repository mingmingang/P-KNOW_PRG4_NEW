import React, { useState, useEffect } from "react";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "../../style/PDF_Viewer.css";
import Loading from "./Loading";
import { API_LINK } from "../util/Constants";

export default function PDF_Viewer({ pdfFileName, width = "1080px", height="1050px"}) {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (pdfFileName) {
      setIsLoading(true);
      const fileUrl = `${API_LINK}Upload/GetFile/${pdfFileName}`; // Anda bisa mengubah URL ini sesuai kebutuhan
      setPdfUrl(fileUrl);
      setIsLoading(false);
    }
  }, [pdfFileName]);

  return (
    <div className="d-flex flex-column" style={{margin:'auto 30px', marginBottom:'50px', borderRadius:'80px'}}>
      <div className="flex-fill">
        {isLoading && <Loading />} {/* Show loading state if needed */}
      </div>
      <div className="mt-3">
        {pdfUrl && (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <div style={{ height: height, borderRadius:'20px', width:width }}>
              <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
}
