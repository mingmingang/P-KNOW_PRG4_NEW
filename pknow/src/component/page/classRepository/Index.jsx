import { useEffect, useRef, useState } from "react";
import { API_LINK, PAGE_SIZE, APPLICATION_ID } from "../../util/Constants";
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
import Table from "../../part/Table";
import AnimatedSection from "../../part/AnimatedSection";

const inisialisasiData = [
  {
    ID: null,
    Nama: null,
    "Nomor Telepon": null,
    Username: null,
    "Tanggal Klaim": null,
    Count: 0,
  },
];

export default function ClassRepositoryIndex({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const cardRefs = useRef([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });

  // Pisahkan status loading untuk setiap bagian
  const [loadingStates, setLoadingStates] = useState({
    userData: true,
    programData: true,
    publikasiData: true,
    eksternalData: true,
    kategoriProgram: true,
  });

  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentDataEksternal, setCurrentDataEksternal] =
    useState(inisialisasiData);
  const [currentDataPublikasi, setCurrentDataPublikasi] =
    useState(inisialisasiData);
  const [listProgram, setListProgram] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

  const [currentFilterPeserta, setCurrentFilterPeserta] = useState({
    page: 1,
    query: "",
    sort: "[Waktu] desc",
    app: APPLICATION_ID,
    status: "Belum Dibaca",
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

  // Helper function untuk update loading state
  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    updateLoadingState("userData", true);

    try {
      let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
        param: activeUser,
      });

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data user.");
      } else {
        setUserData(data[0]);
        setCurrentFilter((prevFilter) => ({
          ...prevFilter,
          kry_id: data[0].kry_id,
        }));
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      updateLoadingState("userData", false);
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const getKK = async () => {
    setIsError({ error: false, message: "" });
    updateLoadingState("programData", true);

    try {
      let data = await UseFetch(
        API_LINK + "Program/GetProgramAll",
        currentFilter
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      } else {
        setCurrentData(data);
      }
    } catch (e) {
      setIsError({ error: true, message: e.message });
    } finally {
      updateLoadingState("programData", false);
    }
  };

  const getProgramPublikasi = async () => {
    setIsError({ error: false, message: "" });
    updateLoadingState("publikasiData", true);

    try {
      let data = await UseFetch(
        API_LINK + "Program/GetDataProgramTerpublikasi",
        currentFilterPublikasi
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      } else {
        setCurrentDataPublikasi(data);
      }
    } catch (e) {
      setIsError({ error: true, message: e.message });
    } finally {
      updateLoadingState("publikasiData", false);
    }
  };

  const getListKategoriProgram = async (filter) => {
    updateLoadingState("kategoriProgram", true);

    try {
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
      } else {
        setListKategoriProgram(data);
      }
    } catch (e) {
      setIsError({
        error: true,
        message: e.message,
      });
    } finally {
      updateLoadingState("kategoriProgram", false);
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
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetCurrentPagePublikasi(newCurrentPage) {
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
        updateLoadingState("programData", true);
        UseFetch(API_LINK + "Program/DeleteProgram", {
          idProgram: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else if (data[0].hasil === "GAGAL") {
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
          .finally(() => updateLoadingState("programData", false));
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
        updateLoadingState("programData", true);
        UseFetch(API_LINK + "Program/SetStatusProgram", {
          idProgram: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else if (data[0].hasil === "ERROR KATEGORI AKTIF") {
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
          .finally(() => updateLoadingState("programData", false));
      }
    });
  }

  const formatTanggal = (tanggalString) => {
    if (!tanggalString) return "-";

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Jika tanggal sudah dalam format Date object
    if (tanggalString instanceof Date) {
      return new Intl.DateTimeFormat("id-ID", options).format(tanggalString);
    }

    // Jika tanggal dalam format string
    const tanggal = new Date(tanggalString);

    // Validasi jika tanggal tidak valid
    if (isNaN(tanggal.getTime())) {
      return tanggalString; // Kembalikan aslinya jika tidak bisa diparse
    }

    return new Intl.DateTimeFormat("id-ID", options).format(tanggal);
  };

  useEffect(() => {
    const fetchEksternalData = async () => {
      setIsError(false);
      updateLoadingState("eksternalData", true);

      try {
        const data = await UseFetch(
          API_LINK + "Klaim/GetUserEksKlaim",
          currentFilterPeserta
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentDataEksternal(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            // ...value,
            ID: value["ext_id"],
            Nama: value["ext_nama_lengkap"],
            "Nomor Telepon": value["ext_no_telp"],
            Username: value["ext_username"],
            "Tanggal Klaim": formatTanggal(value["klaim_tanggal"]),
          }));
          setCurrentDataEksternal(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        updateLoadingState("eksternalData", false);
      }
    };

    fetchEksternalData();
  }, [currentFilterPeserta]);

  // Fungsi untuk mengecek apakah semua loading selesai
  const isLoading = Object.values(loadingStates).some((state) => state);

  return (
    <div className="app-container">
      <AnimatedSection>
        <Search
          title="Class Repository"
          description="ASTRAtech memiliki banyak program studi, di dalam program studi terdapat class repository dari Program Kelompok Keahlian yang dibuat."
          showInput={false}
        />
      </AnimatedSection>

      <>
        <AnimatedSection delay={0.3}>
          <div className="d-flex flex-column">
            <div className="flex-fill container">
              <div className="mt-4">
                <p className="title-kk">Data User Eksternal</p>
              </div>
            </div>

            <div className="container">
              {loadingStates.eksternalData ? (
                <Loading />
              ) : (
                <Table data={currentDataEksternal} />
              )}
            </div>
          </div>

          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}

          <div className="d-flex flex-column">
            <div className="flex-fill container">
              <div className="mt-4">
                <p className="title-kk">Class Training</p>
              </div>

              <>
                <div
                  className="card-keterangan"
                  style={{
                    background: "#61A2DC",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    marginBottom: "20px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  ↓ Belum Dipublikasikan
                </div>

                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row">
                      {loadingStates.programData ? (
                        <div
                          className="d-flex justify-content-center align-items-center w-100"
                          style={{ minHeight: "200px" }}
                        >
                          <Loading />
                        </div>
                      ) : currentData[0]?.Message === "data kosong" ? (
                        <div className="">
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      ) : (
                        (() => {
                          const filteredData = currentData.filter(
                            (value) =>
                              value.Status === "Aktif" &&
                              value.Publikasi != "Terpublikasi"
                          );

                          if (filteredData.length === 0) {
                            return (
                              <div className="">
                                <Alert
                                  type="warning"
                                  message="Tidak ada data yang belum terpublikasi!"
                                />
                              </div>
                            );
                          }

                          return filteredData.map((value, index) => (
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
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </div>
                </div>

                {/* Only show paging if there's data and filtered data exists */}
                {currentData[0]?.ID !== null &&
                  currentData.filter(
                    (value) =>
                      value.Status === "Aktif" &&
                      value.Publikasi != "Terpublikasi"
                  ).length > 0 && (
                    <div className="mb-4 d-flex justify-content-center">
                      <div className="d-flex flex-column">
                        <Paging
                          pageSize={PAGE_SIZE}
                          pageCurrent={currentFilter.page}
                          totalData={currentData[0]?.Count || 0}
                          navigation={handleSetCurrentPage}
                        />
                      </div>
                    </div>
                  )}
              </>

              <>
                <div
                  className="card-keterangan"
                  style={{
                    background: "#61A2DC",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    marginBottom: "20px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  ↓ Terpublikasi
                </div>

                <div className="d-flex flex-column">
                  <div className="flex-fill">
                    <div className="row">
                      {loadingStates.publikasiData ? (
                        <div
                          className="d-flex justify-content-center align-items-center w-100"
                          style={{ minHeight: "200px" }}
                        >
                          <Loading />
                        </div>
                      ) : currentDataPublikasi[0]?.Message === "data kosong" ? (
                        <div className="" style={{ margin: "5px 20px" }}>
                          <Alert type="warning" message="Tidak ada data!" />
                        </div>
                      ) : (
                        currentDataPublikasi
                          .filter(
                            (value) =>
                              value.Status === "Aktif" &&
                              value.Publikasi === "Terpublikasi"
                          )
                          .map((value, index) => (
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
                                }}
                                onChangePage={onChangePage}
                                onChangeStatus={handleSetStatus}
                              />
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </>

              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex flex-column">
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
        </AnimatedSection>
      </>
    </div>
  );
}
