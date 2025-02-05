import { useEffect, useRef, useState, useContext } from "react";
import axios from 'axios';
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import Table from "../../../part/Table";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import KMS_VideoPlayer from "../../../part/VideoPlayer";
import AppContext_test from "./TestContext";
import ReactPlayer from 'react-player';
import PDF_Viewer from "../../../part/PDF_Viewer";
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import WordViewer from "../../../part/DocumentViewer";
import ExcelViewer from "../../../part/ExcelViewer";


  const inisialisasiData = [
    {
    Key: null,
    No: null,
    Kategori: null,
    Judul: null,
    File_pdf: null,
    File_vidio: null,
    Pengenalan: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Sharing_pdf: null,
    Sharing_vidio: null,
    Status: "Aktif",
    Count: 0,
    },
  ];

export default function MasterTestIndex({ onChangePage,materiId }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [fileData, setFileData] = useState({
    file: "",
});
  const [fileExtension, setFileExtension] = useState("");
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode Test] asc",
    status: "Aktif",
  });

  // console.log(materiId)
  
  
  const formUpdate = useRef({
    materiId: AppContext_test.materiId,
    karyawanId: AppContext_test.activeUser,
    totalProgress: "0", 
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: "Fahriel",
  });



  const getFileData = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(
          API_LINK + "Materi/GetDataMateriById",
          {
            id: AppContext_test.materiId,
          }
        );
        if (response.data.length !== 0) {
          const { File_pdf, Judul, Nama, Creadate, NamaKK, Prodi } = response.data[0];

          // Validasi File_pdf dan Judul
          if (!File_pdf || !Judul) {
            console.error("File_pdf atau Judul tidak ditemukan!");
            return;
          }

          const ext = File_pdf.split(".").pop().toLowerCase(); // Dapatkan ekstensi file
          const formattedFileName = `${Judul.replace(/\s+/g, "_")}.${ext}`;

          // Perbarui state
          setFileData({
            file: File_pdf,
            judul: Judul,
            uploader: Nama || "Tidak ada uploader",
            creadate: Creadate || "Tanggal tidak tersedia",
            formattedFileName, // Tambahkan nama file yang diformat
            fileExtension: ext,
            namaKK: NamaKK,
            prodi : Prodi // Tambahkan ekstensi file
          });

          setFileExtension(ext);
          console.log("Judul Materi:", Judul);
          console.log("File PDF:", File_pdf);
          console.log("Formatted File Name:", formattedFileName);
          console.log("File Extension:", ext);

          return; // Keluar dari fungsi setelah selesai
        }

      } catch (error) {
          console.error("Error fetching materi data: ", error);
          if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
              throw error;
          }
      }
  }
};

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

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};


useEffect(() => {
    const fetchData = async () => {
        try {
            await getFileData();
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
}, [AppContext_test.materiId]);

  console.log("coba",currentData)

  if (AppContext_test.progresMateri == "materi_video") {
    formUpdate.current.statusMateri_Video = "Done";
  } else {
    formUpdate.current.statusSharingExpert_Video = "Done";
  }
  console.log("tes materi", AppContext_test.materiId);

async function updateProgres() {
  let success = false;
  let retryCount = 0;
  let maxRetries = 10;

  while (!success && retryCount < maxRetries) {
    try {
      const response = await axios.post(
        API_LINK + "Materi/UpdatePoinProgresMateri",
        {
          materiId: AppContext_test.materiId,
          kry_user : activeUser,
          tipe: 'Materi'
        }
      );
      console.log("respon progres", response.status);
      if (response.status === 200) {
        success = true;
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
      retryCount += 1;
      if (retryCount >= maxRetries) {
        console.error(
          "Max retries reached. Stopping attempts to save progress."
        );
      }
    }
  }
}



  useEffect(() => {
    //saveProgress();
    updateProgres();
  }, []);


return (
  <>
    <div className="d-flex" style={{minHeight:"100vh"}}>
        <KMS_Rightbar
     isActivePengenalan={false}
     isActiveForum={false}
     isActiveSharing={false}
     isActiveSharingPDF={false}
     isActiveSharingVideo={false}
     isActiveMateri={true}
     isActiveMateriPDF={true}
     isActiveMateriVideo={false}
     isActivePreTest={false}
     isActivePostTest={false}
      isOpen={true}
      onChangePage={onChangePage}
      materiId={AppContext_test.materiId}
      // refreshKey={refreshKey}
      // setRefreshKey={setRefreshKey}
    />
    <div className="">
      {isError && (
        <div className="">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data Test."
          />
        </div>
      )}
      <div className=""></div>
        {isLoading ? (
          <Loading />
        ) : (
          <>
          <div style={{  marginTop:"100px", marginBottom:"80px" }}>
           <h1 style={{ fontWeight: 600, color: "#002B6C" }} className="ml-4">Materi {fileData.judul}</h1>
           <br />
                    <h6 className="mb-0 ml-4" style={{ color: "#002B6C" }}>
                      Dari {fileData.namaKK} - {fileData.prodi}
                    </h6>
                    <br />
                        <h6 style={{ color: "#002B6C" }} className="ml-4">
                            Oleh {fileData.uploader} - {formatDate(fileData.creadate)}
                        </h6>
                        {fileExtension === "pdf" && (
           <div className="">{fileData.file ? (
            <PDF_Viewer 
              pdfFileName={fileData.file} 
              width="1000px" 
              height="800px" 
            />
          ) : (
            <div className="alert alert-warning mt-4 mb-4 ml-4" >
            Tidak ada Materi yang tersedia.
            </div>
          )}</div>
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
            <div className="ml-4">
            <WordViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} width="1000px"/>
            </div>
          )}
          {fileExtension === "xlsx" && (
           <div className="ml-4">
           <ExcelViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} width="1000px" />
           </div>
          )}
           {fileExtension === "pptx" && (
            <div className="">
            <p style={{marginLeft:"25px", marginTop:"20px"}}>
              Dokumen Power Point tidak dapat ditampilkan di sini. Silahkan klik tombol dibawah ini untuk melihatnya.
              {/* <a href={`${API_LINK}Upload/GetFile/${fileData.file}`} download>
                unduh
              </a>{" "} */}  
            </p>
            <button onClick={() => {
                        setupDownload(
                          `${API_LINK}Upload/GetFile/${fileData.file}`,
                          fileData.formattedFileName
                        );
                      }}  style={{border:"none",backgroundColor:"#0E6EFE", borderRadius:"10px", padding:"10px", marginLeft:"25px", color:"white"}}>Unduh Materi</button>
            </div>
          )}
                        

                        </div>
          </>
        )}
    </div>
    </div>
  </>
);
}