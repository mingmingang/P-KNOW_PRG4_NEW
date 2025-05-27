import { useState, useEffect } from "react";
import PDF_Viewer from "./PDF_Viewer";
import imgDapus from "../../assets/DaftarPustaka/sistemAbsensiMenggunakanFace.png";
import "../../style/DaftarPustaka.css";
import backPage from "../../assets/backPage.png";
import Konfirmasi from "./Konfirmasi";
import { API_LINK } from "../util/Constants";
import Video_Viewer from "../part/VideoPlayer";
import ReactPlayer from "react-player";
import WordViewer from "./DocumentViewer";
import ExcelViewer from "./ExcelViewer";
import axios from "axios";
import { decode } from "he";



export default function DetailDaftarPustaka({ onChangePage, withID }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("Konfirmasi");
  const [pesanKonfirmasi, setPesanKonfirmasi] = useState(
    "Apakah Anda ingin meninggalkan halaman ini?"
  );
  const [fileExtension, setFileExtension] = useState("");

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index");
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [fileData, setFileData] = useState({
    key: "",
    judul: "",
    deskripsi: "",
    gambar: "",
    katakunci: "",
    file: "",
  });

  useEffect(() => {
    if (withID && withID.File && withID.Judul) {
      // Dapatkan ekstensi file
      const ext = withID.File.split(".").pop().toLowerCase();
  
      // Format nama file dengan mengganti spasi menjadi underscore
      const formattedFileName = `${withID.Judul.replace(/\s+/g, "_")}.${ext}`;
  
      // Set data file
      setFileData({
        key: withID.id,
        judul: withID.Judul,
        deskripsi: withID.Keterangan,
        gambar: withID.Gambar,
        katakunci: withID.kataKunci,
        formattedFileName, // Nama file yang dikustomisasi
        file: withID.File,
      });
  
      // Set ekstensi file
      setFileExtension(ext);
    }
  }, [withID]);
  
  const setupDownload = async (fileUrl, formattedFileName) => {
    try {
      // Fetch file dari server
      const response = await axios.get(fileUrl, {
        responseType: "blob", // Pastikan menerima data dalam bentuk Blob
      });

      // Buat URL untuk Blob
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      // Buat elemen <a> untuk unduhan
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formattedFileName; // Tetapkan nama file unduhan

      // Tambahkan ke DOM dan klik untuk memulai unduhan
      document.body.appendChild(link);
      link.click();

      // Hapus elemen <a> setelah selesai
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Bersihkan URL Blob
    } catch (error) {
      console.error("Error setting up download:", error);
    }
    };

  return (
    
    <div className="container" style={{marginTop:"100px"}}>
      <div className="back-title-daftar-pustaka">
        <button
          onClick={handleGoBack}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <img src={backPage} alt="Back" className="back" />
        </button>
        <h1 className="title">Knowledge Database</h1>
      </div>
      <div className="container card mb-4 py-4 px-3">
        <div className="pustaka-layout">
          <div className="daftar-pustaka-title-layout">
            <img
              src={`${API_LINK}Upload/GetFile/${fileData.gambar}`}
              alt="Daftar Pustaka"
              className="cover"
              style={{objectFit:"cover"}}
            />
          </div>

          <div className="detail-daftar-pustaka">
            <div className="detail-informasi-daftar-pustaka">
              <h3>Judul</h3>
              <p>{decode(fileData.judul)}</p>
            </div>
            <div className="detail-informasi-daftar-pustaka">
              <h3>Deskripsi</h3>
              <p style={{textAlign:"justify"}}>{decode(fileData.deskripsi)}</p>
            </div>
            <div className="detail-informasi-daftar-pustaka">
              <h3>Kata Kunci</h3>
              <p>
                <span>
                  {Array.isArray(withID["Kata Kunci"])
                    ? withID["Kata Kunci"].join(", ")
                    : withID["Kata Kunci"]}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="file-preview">
          {fileExtension === "pdf" && (
            <PDF_Viewer pdfFileName={fileData.file} />
          )}
          {fileExtension === "mp4" && (
            <ReactPlayer
              url={`${API_LINK}Upload/GetFile/${fileData.file}`}
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              style={{ borderRadius: "80px" }}
            />
          )}
          {/* Anda bisa menambahkan lebih banyak kondisi untuk file lain seperti .docx atau .xlsx */}
          {fileExtension === "docx" && (
            <>
            {/* <p style={{marginLeft:"25px", marginTop:"20px"}}>
              Dokumen Word tidak dapat ditampilkan di sini. Silahkan klik tombol dibawah ini untuk melihatnya.
             <a href={`${API_LINK}Upload/GetFile/${fileData.file}`} download>
                unduh
              </a>{" "}
            </p> */}
            {/* <button  style={{border:"none",backgroundColor:"#0E6EFE", borderRadius:"10px", padding:"10px", marginLeft:"25px"}}> <a style={{color:"white"}} href={`${API_LINK}Upload/GetFile/${fileData.file}`} className="text-decoration-none" download="Pustaka_Learning_Database_Sahar_Romansa.docx"  >Unduh Pustaka</a></button> */}

    <WordViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData}/>
    
           </>
          )}
           {fileExtension === "pptx" && (
             <>
            <p style={{marginLeft:"25px", marginTop:"20px"}}>
              Dokumen Power Point tidak dapat ditampilkan di sini. Silahkan klik tombol dibawah ini untuk melihatnya.
              
            </p>
            <button onClick={() => {
                        setupDownload(
                          `${API_LINK}Upload/GetFile/${fileData.file}`,
                          fileData.formattedFileName
                        );
                      }}
 style={{border:"none",backgroundColor:"#0E6EFE", borderRadius:"10px", padding:"10px", marginLeft:"25px", color:"white"}}>Unduh Pustaka</button>
           </>
        // <PowerPointViewerIframe fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} />
            
          )}
          {fileExtension === "xlsx" && (
           <>
            {/* <p style={{marginLeft:"25px", marginTop:"20px"}}>
              Dokumen Excel tidak dapat ditampilkan di sini. Silahkan klik tombol dibawah ini untuk melihatnya.
              
            </p>
            <button  style={{border:"none",backgroundColor:"#0E6EFE", borderRadius:"10px", padding:"10px", marginLeft:"25px"}}> <a style={{color:"white"}} href={`${API_LINK}Upload/GetFile/${fileData.file}`} className="text-decoration-none" download>Unduh Pustaka</a></button> */}

            <ExcelViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} />
           </>
          )}
        </div>
      </div>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : konfirmasi}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : pesanKonfirmasi}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </div>
  );
}
