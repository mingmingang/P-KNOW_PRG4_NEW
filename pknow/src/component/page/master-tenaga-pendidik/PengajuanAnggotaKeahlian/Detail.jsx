import React, { useEffect, useState } from "react";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Table from "../../../part/Table";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import Label from "../../../part/Label";
import FileUpload from "../../../part/FileUpload";
import Icon from "../../../part/Icon";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "ID Lampiran": null,
    Lampiran: null,
    Karyawan: null,
    Status: null,
    Count: 0,
  },
];

export default function PengajuanDetail({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);  
  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

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


  const getUserKryID = async () => {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setIsLoading(true);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body.textContent;
    return decodedString || str; // Jika decoding gagal, gunakan string asli
  };

  
  const getListLampiran = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);
  
    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        page: 1,
        sort: "[ID Lampiran] ASC",
        akk_id: withID.Key,
      });
  
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil Detail Lampiran.");
      } else if (data.length === 0) {
        setListNamaFile([]);
      } else {
        const updatedData = data.map((item) => {
          if (item.Lampiran) {
            try {
              // Decode HTML entities sebelum parsing JSON
              const cleanedLampiran = decodeHtmlEntities(item.Lampiran);
  
              // Parse JSON string
              const parsedLampiran = JSON.parse(cleanedLampiran);
  
              // Proses setiap file di dalam parsedLampiran
              const fileUrls = parsedLampiran.map((file) => {
                return `${API_LINK}Upload/GetFile/${file.pus_file}`;
              });
  
              // Tambahkan fileUrls ke objek item
              return { ...item, Lampiran: fileUrls };
            } catch (err) {
              console.error("Gagal mem-parse JSON Lampiran:", err);
              return { ...item, Lampiran: [] }; // Default ke array kosong jika parsing gagal
            }
          }
          return item; // Jika tidak ada Lampiran, return item as is
        });
        setDetail(updatedData); // Update state dengan data baru
      }
    } catch (error) {
      console.error("Error fetching detail lampiran:", error);
      setDetail(null);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    getListLampiran();
  }, [withID]);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <>
        <div className="" style={{display:"flex", justifyContent:"space-between", marginTop:"100px", marginLeft:"70px", marginRight:"70px"}}>
        <div className="back-and-title" style={{display:"flex"}}>
          <button style={{backgroundColor:"transparent", border:"none"}} onClick={handleGoBack}><img src={BackPage} alt="" /></button>
            <h4 style={{ color:"#0A5EA8", fontWeight:"bold", fontSize:"30px", marginTop:"10px", marginLeft:"20px"}}>Pengajuan Kelompok Keahlian</h4>
          </div>
            <div className="ket-draft">
            <p className="mb-0" style={{fontWeight:"600", marginTop:"10px"}}><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: "#FFC107",
            marginRight: "20px",
            width: "10px",
          }}
        />Menunggu Persetujuan Prodi</p>
            </div>
          </div>
          <div className="" style={{margin:"10px 80px"}}>
        <form>
          <div className="card">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-6">
                  <Label title="Nama" data={userData.Nama} />
                </div>
                <div className="col-lg-6">
                  <Label title="Jabatan" data={userData.Role} />
                </div>
                <div className="col-lg-6 my-3">
                  <Label
                    title="Kelompok Keahlian"
                    data={withID["Nama Kelompok Keahlian"]}
                  />
                </div>
                <div className="col-lg-6 my-3">
                  <Label title="Status" data={withID.Status === "Menunggu Acc" ? "Menunggu Persetujuan" : withID.Status} />
                </div>
                <div className="col-lg-12">
                <div className="fw-medium mb-2">Lampiran Pendukung</div>
                <div className="card">
                  <div className="card-body p-4">
                  {detail?.map((item, index) => (
                    <div key={index}>
                      {item.Lampiran ? (
                        // Check if Lampiran is a string before splitting
                        Array.isArray(item.Lampiran)
                          ? item.Lampiran.map((link, linkIndex) => (
                            
                              <div key={linkIndex}>
                                <h5 className="mb-3" style={{marginTop:"15px"}}>{`Lampiran ${linkIndex + 1}`}</h5>
                                <a
                                href={link.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none fw-bold mb-4"
                                style={{
                                  background: "white",
                                  color: "#0A5EA8",
                                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                                  fontSize: "18px",
                                  padding: "8px 10px",
                                  borderRadius: "10px",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#0A5EA8";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "white";
                                  e.target.style.color = "#0A5EA8";
                                }}
                              >
                                {`Lampiran ${linkIndex + 1} ${withID["Nama Kelompok Keahlian"]}`}
                              </a>

                              </div>
                            ))
                          : typeof item.Lampiran === "string" 
                            ? item.Lampiran.split(",").map((link, linkIndex) => (
                                <div key={linkIndex}>
                                  <h5 className="mb-3">{`Lampiran ${index + 1}`}</h5>
                                  <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                                    {`Lampiran ${linkIndex + 1} ${withID["Nama Kelompok Keahlian"]}`}
                                  </a>
                                </div>
                              ))
                            : <p>Invalid Lampiran format</p> // Handle non-string cases
                      ) : (
                        <p>Tidak ada lampiran</p>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        </div>
        {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : "Anda yakin ingin simpan data?"}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
        )}
        </>
      )}
    </>
  );
}
