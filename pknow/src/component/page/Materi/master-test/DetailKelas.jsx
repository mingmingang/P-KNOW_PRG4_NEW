import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "he";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { jsPDF } from 'jspdf';
import logo from "../../../../assets/loginMaskotTMS.png";
import AppContext_master from "../master-proses/MasterContext.jsx";
import AppContext_test from "./TestContext.jsx";

export default function DetailKelas({ withID, onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [activeCategory, setActiveCategory] = useState(null); 
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [listMateri, setlistMateri] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
    KKid: "",
  });

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };



  const getListKategoriProgram = async (filter) => {
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByIDProgram",
          {
            page: withID.id,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "Aktif",
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setListKategoriProgram([]);
          break;
        } else if (data.length === 0) {
          setListKategoriProgram([]);
          break;
        } else {
          setListKategoriProgram(data);
          break;
        }
      }
    } catch (e) {
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getListKategoriProgram();
    };

    fetchData();
  }, []);

  const getDataMateriKategori = async (index) => {
    const kategoriKey = index;
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Materi/GetDataMateriByKategori", {
          page: 1,
          status: "Semua",
          query: "",
          sort: "Judul",
          order: "asc",
          kategori: kategoriKey,
        });
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setlistMateri([]);
          break;
        } else if (data.length === 0) {
          setlistMateri([]);
          break;
        } else {
          setlistMateri(data);
          setActiveCategory(kategoriKey); // Set kategori aktif
          break;
        }
      }
    } catch (e) {
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }


  const toggleCategory = (kategoriKey) => {
    // Jika kategori yang diklik adalah kategori aktif, tutup (set null).
    if (activeCategory === kategoriKey) {
      setActiveCategory(null);
    } else {
      // Jika kategori yang diklik berbeda, jadikan kategori aktif.
      setActiveCategory(kategoriKey);
      getDataMateriKategori(kategoriKey);
    }
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onChangePage("pengenalan", true, book.Key, true);
  };

  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');

  const generateCertificate = () => {
    const doc = new jsPDF('landscape');
    
    // Set up the certificate layout
    doc.setFont('poppins', 'bold');
    doc.setFontSize(28);
    doc.text('Certificate of Completion', 105, 40, null, null, 'center');

    // Course Info
    doc.setFontSize(14);
    doc.text('MySkill E-Learning Course', 105, 55, null, null, 'center');
    doc.text(`Topic: ${course}`, 105, 70, null, null, 'center');
    doc.setFontSize(22);
    doc.text('MICROSOFT EXCEL INTRODUCTION', 105, 90, null, null, 'center');

    // Recipient Info
    doc.setFontSize(18);
    doc.text(`This certificate is awarded to:`, 105, 120, null, null, 'center');
    doc.setFontSize(24);
    doc.text(name, 105, 140, null, null, 'center');
    
    // Date Info
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 105, 170, null, null, 'center');

    // Signature
    doc.setFontSize(12);
    doc.text('______________________________', 50, 210); // Signature Line
    doc.text('Angga Fauzan', 50, 220);
    doc.text('CEO MySkill', 50, 230);

    // Add Logo (example: replace with actual logo or image)
    doc.addImage(logo, 'PNG', 15, 15, 30, 30); // Adjust the position and size as needed

    // Save as PDF
    doc.save('Sertifikat_Penghargaan.pdf');
  };


  return (
    <div className="app-container">
     <div
  className="header"
  style={{
    height: "400px",
    width: "100%",
    padding: "100px 60px",
    backgroundImage: `linear-gradient(to right, #0A5EA8, rgba(0,0,0,0)), url(${API_LINK}Upload/GetFile/${withID.gambar})`,
    objectFit:"cover",
    backgroundSize: "55%", // Gambar hanya mengambil 50% dari tinggi div
    backgroundRepeat: "no-repeat", // Hindari pengulangan gambar
    backgroundPosition: "right", // Posisikan gambar di tengah
    backgroundBlendMode: "overlay", // Satukan gradien dengan gambar
  }}
>
  <>
<div
    className="background"
    style={{
      position: 'absolute',
      top: "0",
      left: "0",
      height: "400px",
      width: "100%",
      backgroundImage: `
        linear-gradient(to right, #0A5EA8, rgba(0,0,0,0)), 
        linear-gradient(to right, #0A5EA8, #66a2fe)`,
        padding:"80px 50px 40px 60px",
      backgroundSize: "47% 100%", // Gradien kiri mengambil 45% lebar
      backgroundRepeat: "no-repeat",
    }}
  >
    <h4 style={{ color: "white", padding: "30px", paddingBottom: "0px" }}>
          <button
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={handleGoBack}
          >
           <i className="fas fa-arrow-left mr-3" style={{color:"white"}}></i>
          </button>
          {decode(withID.title ? withID.title : "")}
        </h4>
        <p style={{ paddingLeft: "30px", color: "white" }}>
        Program Studi : {decode(withID.ProgramStudi)}
        </p>
        <p
          style={{
            paddingLeft: "30px",
            paddingRight:"40px",
            color: "white",
            width: "600px",
            fontSize: "14px",
            textAlign:"justify"
          }}
        >
          {decode(withID.desc).substring(0, 300)}{/* Menampilkan 200 huruf pertama */}
          {withID.desc.length > 300 && "..."}
        </p>

        <div className="" style={{width:"400px", marginTop:"40px"}}>
                      <button
                        className="btn btn-outline-primary ml-4"
                        type="button"
                        style={{fontSize:"22px", marginTop:"-10px", color:"white", borderColor:"white"}}
                        onClick={() => document.getElementById("materi").scrollIntoView({ behavior: "smooth" })}
                      >
                        Baca Materi
                      </button>
                    </div>
        

        </div>
</>
      </div>
      <div className="" style={{ margin: "40px 100px" }}>
        <h3 style={{ fontWeight: "500", color: "#0A5EA8" }}>Tentang Kelas</h3>
        <p
        id="materi"
          style={{
            textAlign: "justify",
            marginTop: "20px",
            lineHeight: "30px",
          }}
        >
          {decode(withID.desc)}
        </p>
      </div>

      <div className="" style={{ margin: "40px 100px" }}>
        <h3 className="mb-4"  style={{ fontWeight: "500", color: "#0A5EA8" }}>Materi Kelas</h3>

{listKategoriProgram.length > 0 ? (
  listKategoriProgram.map((kategori, index) => (
    <div
      key={index}
      className="section"
      style={{
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "10px",
      }}
      onClick={() => toggleCategory(kategori.Key)}
    >
      <div
        className="section-header"
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      ></div>
      <p style={{ fontSize: "16px", color: "#555", fontWeight: "bold" }}>
        <i
          className={`fas ${
            activeCategory === kategori.Key ? "fa-chevron-up" : "fa-chevron-down"
          } mr-3 ml-3`}
          style={{
            fontSize: "16px",
          }}
        ></i>
        {decode(
                  kategori["Nama Kategori Program"]
                    ? kategori["Nama Kategori Program"]
                    : "Tidak ada deskripsi."
                )} <br />
      </p>
      {/* Render list materi jika kategori ini aktif */}
      {activeCategory === kategori.Key && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            borderTop: "1px solid #ccc",
          }}
        >
        {listMateri.length > 0 ? (
        listMateri
              .filter((materi) => materi.Status === "Aktif") // Filter materi yang Statusnya 'Aktif'
              .map((materi, materiIndex) => (
                <div
                  className="d-flex"
                  key={materiIndex}
                  style={{
                    background: "#f9f9f9",
                    marginBottom: "8px",
                    padding: "8px",
                    borderRadius: "5px",
                  }}
                >
                  <div className="">
                    <img
                      className="cover-daftar-kk"
                      style={{ borderRadius: "20px" }}
                      height="150"
                      src={`${API_LINK}Upload/GetFile/${materi.Gambar}`}
                      width="300"
                    />
                  </div>
                  <div className="ml-3" style={{width:"120%"}} >
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#0A5EA8",
                        margin: "0",
                      }}
                    >
                      {decode(materi.Judul ? materi.Judul : "Judul tidak tersedia")}
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#555",
                        width: "90%",
                        textAlign: "justify",
                      }}
                    >
                      {decode(materi.Keterangan ? materi.Keterangan : "Deskripsi tidak tersedia")}
                    </p>
                  </div>
                  <div className="" style={{width:"300px", marginTop:"40px"}}>
                      <button
                        className="btn btn-outline-primary mt-2 ml-2"
                        type="button"
                        onClick={() => handleBacaMateri(materi)}
                      >
                        Baca Materi
                      </button>
                    </div>
                </div>
              ))
          ) : (
            <Alert
            type="warning mt-3"
            message="Tidak ada materi yang tersedia pada kategori ini"
          />
          )}

        </div>
      )}
    </div>
  ))
) : (
  <Alert
  type="warning mt-3"
  message="Tidak ada kategori program yang tersedia"
/>
)}
      </div>
      <>
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
      </>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={
            isBackAction
              ? "Apakah anda ingin kembali?"
              : "Anda yakin ingin simpan data?"
          }
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </div>
  );
}
