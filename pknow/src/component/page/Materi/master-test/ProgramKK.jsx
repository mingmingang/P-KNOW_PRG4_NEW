import { useEffect, useRef, useState } from "react";
import { API_LINK, PAGE_SIZE } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import SweetAlert from "../../../util/SweetAlert";
import Search from "../../../part/Search";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import CardClassTraining from "../../../part/CardKelasTraining";
import Paging from "../../../part/Paging";
import "../../../../../src/index.css";
import Button2 from "../../../part/Button copy";
import Input from "../../../part/Input";
import Konfirmasi from "../../../part/Konfirmasi";
import Filter from "../../../part/Filter";
import BackPage from "../../../../assets/backPage.png";
import { decode } from "he";

export default function ProgramKK({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const cardRefs = useRef([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [listProgram, setListProgram] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

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
    onChangePage("index", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };


  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            kry_id: data[0].kry_id,
          }));
          break;
        }
      }
    } catch (error) {
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

  const getKK = async () => {
    setIsError({ error: false, message: "" });
    //setIsLoading(true);
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgramByKK", {
          id: withID.id,
        });
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
        } else {
          setCurrentData(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError({ error: true, message: e.message });
    }
  };

  const getListKategoriProgram = async (filter) => {
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByProgram",
          {
            page: 1,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "",
            kkeID: filter,
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
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
      await getKK();
    };

    fetchData();
  }, []);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  // DELETE PERMANEN DATA PROGRAM
  function handleDelete(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin <b>menghapus permanen</b> data ini?",
      "warning",
      "Hapus"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "Program/DeleteProgram", {
          idProgram: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else if (data[0].hasil === "GAGAL") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menghapus program karena sudah terdapat Draft Kategori.",
              });
            } else {
              SweetAlert("Sukses", "Data berhasil dihapus.", "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (data.Status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.Status === "Aktif")
      message = "Apakah anda yakin ingin menonaktifkan data ini?";
    else if (data.Status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "Program/SetStatusProgram", {
          idProgram: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else if (data[0].hasil === "ERROR KATEGORI AKTIF") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menonaktifkan Program karena terdapat kategori berstatus Aktif.",
              });
            } else {
              let message;
              if (status === "Tidak Aktif") {
                message = "Data berhasil dinonaktifkan.";
              } else if (status === "Aktif") {
                message = "Sukses! Data berhasil dipublikasi.";
              }
              SweetAlert("Sukses", message, "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  return (
    <div className="app-container">
      <div className="backSearch">
        <h1>{"Program " + decode(withID.title)}</h1>
        <p>
          Jelajahi seluruh program-program yang tersedia didalam Kelompok
          Keahlian dan akses seluruh Materi yang diberikan.
        </p>
        <div className="conatainer">
        <div className="input-wrapper">
          {/* <div
            className=""
            style={{
              width: "700px",
              display: "flex",
              backgroundColor: "white",
              borderRadius: "20px",
              height: "40px",
            }}
          >
            <Input
              // ref={searchQuery}
              forInput="pencarianKK"
              placeholder="Cari Program"
              style={{
                border: "none",
                width: "680px",
                height: "40px",
                borderRadius: "20px",
              }}
            />
            <Button2
              iconName="search"
              classType="px-4"
              title="Cari"
              // onClick={handleSearch}
              style={{ backgroundColor: "transparent", color: "#08549F" }}
            />
          </div> */}
        </div>
        </div>
      </div>
      <>
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <div className="flex-fill">
             <div className="container">
              <div className="navigasi-layout-page">
                <p className="title-kk"><button style={{backgroundColor:"transparent", border:"none", marginRight:"10px"}} onClick={handleGoBack}><img src={BackPage} width="50px" alt="" />
           {/* <i className="fas fa-arrow-left mr-3" style={{color:"#0A5EA8"}}></i> */}
          </button>Program</p>
              </div>
              </div>
              <>
              <div className="container">
                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    {currentData.filter(
                      (value) =>
                        value.Status === "Aktif"
                    ).length === 0 ? (
                      <div className="alert alert-warning"  role="alert">
                        Belum ada program di kelompok keahlian ini saat ini
                      </div>
                    ) : (
                      <div className="row" >
                        {currentData
                          .filter(
                            (value) =>
                              value.Status === "Aktif" &&
                              value.Publikasi !== "Terpublikasi"
                          )
                          .map((value, index) => {
                            return (
                              <div key={index} className="col-12 col-md-4 mb-4">
                                <CardClassTraining
                                  data={{
                                    id: value.Key,
                                    title: value["Nama Program"],
                                    desc: value.Deskripsi,
                                    status: value.Status,
                                    gambar: value.Gambar,
                                    ProgramStudi: value.ProgramStudi,
                                    harga: value.Harga,
                                    publikasi: value.Publikasi,
                                    cek:"dapat akses",
                                    PIC: value.PIC
                                  }}
                                  onChangePage={onChangePage}
                                  onChangeStatus={handleSetStatus}
                                  detailProgram="ya"
                                />
                              </div>
                            );
                          })}
                          
                      </div>
                    )}
                  </div>
                  
                </div>
                </div>
              </>

              <div className="mb-4 d-flex justify-content-center">
                <div
                  className="d-flex flex-column"
                >
                  <Paging
                    pageSize={PAGE_SIZE}
                    pageCurrent={currentFilter.page}
                    totalData={currentData[0]?.Count || 0}
                    navigation={handleSetCurrentPage}
                  />
                </div>
              </div>

            </div>
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
