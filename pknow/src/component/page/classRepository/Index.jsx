import { useEffect, useRef, useState } from "react";
import { API_LINK, PAGE_SIZE } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import SweetAlert from "../../util/SweetAlert";
import Search from "../../part/Search";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import CardClassTraining from "../../part/CardKelasTraining";
import Paging from "../../part/Paging";
import "../../../../src/index.css";

export default function ClassRepositoryIndex({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const cardRefs = useRef([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [currentDataPublikasi, setCurrentDataPublikasi] = useState(null);
  const [listProgram, setListProgram] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

  const [currentFilterPublikasi, setCurrentFilterPublikasi] = useState({
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

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
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
    setIsLoading(true);
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "Program/GetProgramAll",
          currentFilter
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
        }  else {
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


  const getProgramPublikasi = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "Program/GetDataProgramTerpublikasi",
          currentFilterPublikasi
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
        }
        else {
          setCurrentDataPublikasi(data);
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
      await getProgramPublikasi();
    };
  

    fetchData();
  }, [currentFilter, currentFilterPublikasi]);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetCurrentPagePublikasi(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilterPublikasi((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

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
      <Search
        title="Class Repository"
        description="ASTRAtech memiliki banyak program studi, di dalam program studi terdapat class repository dari Program Kelompok Keahlian yang dibuat."
        showInput={false}
      />
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
              <div className="navigasi-layout-page">
                <p className="title-kk">Class Training</p>
                {/* <div className="left-feature">
            <div className="tes" style={{ display: "flex" }}>
              <div className="mt-1">
              <Filter handleSearch={handleSearch}>
                      <DropDown
                        ref={searchFilterSort}
                        forInput="ddUrut"
                        label="Urut Berdasarkan"
                        type="none"
                        arrData={dataFilterSort}
                        defaultValue="[Judul Pustaka] asc"
                      />
                    </Filter>
              </div>
              {activerole !== "ROL05" && (
          <div className="mt-1">
            <ButtonPro
              style={{ marginLeft: "20px" }}
              iconName="add"
              classType="primary py-2 rounded-4 fw-semibold"
              label="Tambah Pustaka"
              onClick={() => onChangePage("add")}
            />
          </div>
        )}
            </div>
          </div> */}
              </div>
              <>
              <div
                className="card-keterangan"
                style={{
                  background: "red",
                  borderRadius: "5px",
                  padding: "10px 20px",
                  width: "40%",
                  marginLeft: "80px",
                  marginBottom: "20px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                ↓ Belum Dipublikasikan
              </div>
              {console.log("data belum", currentData)}
                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row" style={{ margin: "10px 50px" }}>
                    {currentData[0]?.Message === "data kosong" && (
                        <div className="" style={{ margin: "5px 20px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentData
                        .filter((value) => value.Status === "Aktif" && value.Publikasi != "Terpublikasi" ) // Filter hanya data dengan status Aktif
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
                                  harga : value.Harga,
                                  publikasi: value.Publikasi
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>

              <div className="mb-4 d-flex justify-content-center">
                <div
                  className="d-flex flex-column"
                  style={{ marginLeft: "70px", marginBottom: "40px" }}
                >
                  <Paging
                    pageSize={PAGE_SIZE}
                    pageCurrent={currentFilter.page}
                    totalData={currentData[0]?.Count || 0}
                    navigation={handleSetCurrentPage}
                  />
                </div>
              </div>

              <>
              <div
                className="card-keterangan"
                style={{
                  background: "#61A2DC",
                  borderRadius: "5px",
                  padding: "10px 20px",
                  width: "40%",
                  marginLeft: "80px",
                  marginBottom: "20px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                ↓ Terpublikasi
              </div>
                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row" style={{ margin: "10px 50px" }}>
                    {currentDataPublikasi[0]?.Message === "data kosong" && (
                        <div className="" style={{ margin: "5px 20px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      )}
                      {currentDataPublikasi
                        .filter((value) => value.Status === "Aktif" && value.Publikasi == "Terpublikasi") // Filter hanya data dengan status Aktif
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
                                  harga : value.Harga,
                                  publikasi: value.Publikasi
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>

              <div className="mb-4 d-flex justify-content-center">
                <div
                  className="d-flex flex-column"
                  style={{ marginLeft: "70px", marginBottom: "40px" }}
                >
                  <Paging
                    pageSize={PAGE_SIZE}
                    pageCurrent={currentFilterPublikasi.page}
                    totalData={currentDataPublikasi[0]?.Count || 0}
                    navigation={handleSetCurrentPagePublikasi}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
