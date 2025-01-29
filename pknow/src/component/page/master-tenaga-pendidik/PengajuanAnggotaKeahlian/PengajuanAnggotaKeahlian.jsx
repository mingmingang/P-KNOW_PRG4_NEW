import React from "react";
import { useEffect, useRef, useState } from "react";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Label from "../../../part/Label";
import CardPengajuanBaru from "../../../part/CardPengajuanBaru";
import Alert from "../../../part/Alert";
import "../../../../index.css";
import Search from "../../../part/Search";
import Button2 from "../../../part/Button copy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

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
const inisialisasiKK = [
  {
    Key: null,
    No: null,
    Nama: null,
    PIC: null,
    Deskripsi: null,
    Status: "Aktif",
    Count: 0,
  },
];
const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
];

export default function PengajuanKelompokKeahlian({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const searchQuery = useRef();
  const searchFilterSort = useRef();

  function handleSearch() {
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
      };
    });
  }

  async function pencaharian() {
    setIsLoading(true); // Set loading state
    try {
      const data = await UseFetch(API_LINK + "PengajuanKK/GetAnggotaKK", {
        ...currentFilter,
        query: searchQuery.current.value, // Pastikan query dikirim
      });

      if (data && data.length > 0) {
        setListKK(data); // Perbarui data jika ditemukan
        console.log("Data ditemukan:", data);
      } else {
        setListKK([]); // Kosongkan jika tidak ada hasil
        console.log("Data tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error during search:", error);
      setListKK([]); // Kosongkan jika terjadi error
    } finally {
      setIsLoading(false); // Set loading state selesai
    }
  }

  const [show, setShow] = useState(false);
  const [isError, setIsError] = useState(false);
  const [dataAktif, setDataAktif] = useState(false);
  const [listKK, setListKK] = useState(inisialisasiKK);
  const [detail, setDetail] = useState(inisialisasiData);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] ASC",
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
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            kry_id: data[0].kry_id,
          }));
          console.log("id kry",data[0].kry_id)
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

  const filterUniqueKK = (data) => {
    let waitingAccCount = 0; // Hitung jumlah entri "Menunggu Acc"
    const uniqueKK = data.reduce((acc, current) => {
      const existing = acc.find((item) => item["ID KK"] === current["ID KK"]);
  
      if (!existing) {
        // Tambahkan jika belum ada
        acc.push(current);
        if (current.Status === "Menunggu Acc") {
          waitingAccCount++;
        }
      } else {
        // Prioritaskan "Aktif" di atas status lainnya
        if (current.Status === "Aktif") {
          acc = acc.map((item) =>
            item["ID KK"] === current["ID KK"] ? current : item
          );
        } else if (
          current.Status === "Menunggu Acc" &&
          existing.Status !== "Aktif" &&
          waitingAccCount < 2
        ) {
          // Ganti dengan "Menunggu Acc" jika belum mencapai batas
          acc = acc.map((item) =>
            item["ID KK"] === current["ID KK"] ? current : item
          );
          waitingAccCount++;
        }
      }
  
      return acc;
    }, []);
  
    return uniqueKK;
  };
  
  
  const getDataKKStatusByUser = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    if (currentFilter.kry_id === "") return;
  
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "PengajuanKK/GetAnggotaKK", currentFilter);
  
        console.log("dataaa", data);
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          // Format data awal
          const formattedData = data.map((value) => {
            if (value.Status === "Ditolak" || value.Status === "Dibatalkan") {
              return { ...value, Status: "Kosong" };
            }
            return value;
          });
  
          // Filter data untuk memastikan keunikan dan maksimal 2 "Menunggu Acc"
          const uniqueData = filterUniqueKK(formattedData);
  
          // Hitung status "Menunggu Acc"
          const waitingCount = uniqueData.filter(
            (value) => value.Status === "Menunggu Acc"
          ).length;
  
          // Atur status menjadi "None" jika lebih dari 2 "Menunggu Acc"
          const finalData = uniqueData.map((value) => {
            if (waitingCount === 2 && value.Status !== "Menunggu Acc") {
              return { ...value, Status: "None" };
            }
            return value;
          });

          console.log("data final", finalData)
  
          setListKK(finalData);
          break;
        }
      }
    } catch (error) {
      setListKK([]);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getDataKKStatusByUser();
  }, [currentFilter]);

  const getDataAktif = (data) => {
    console.log("data aktif", data)
    return data.find((value) => value.Status === "Aktif");
  };

  useEffect(() => {
    setDataAktif(getDataAktif(listKK));
  }, [listKK]);

  useEffect(() => {
    if (dataAktif) {
      const formattedData = listKK.map((value) => {
        if (value.Status === "Kosong") return { ...value, Status: "None" };
        return value;
      });
      setListKK(formattedData);
    }
  }, [dataAktif]);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body
      .textContent;
    return decodedString || str; // Jika decoding gagal, gunakan string asli
  };

  const getLampiran = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        page: 1,
        sort: "[ID Lampiran] ASC",
        akk_id: dataAktif.Key,
      });

      console.log("tes", data);

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
              return { ...item, Lampiran: [] };
            }
          }
          return item;
        });
        setDetail(updatedData);
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
    console.log(dataAktif);
    if (dataAktif) getLampiran();
  }, [dataAktif]);

  return (
    <>
      <div className="app-container">
        <main>
          <div className="backSearch">
            <h1>Pengajuan Anggota Keahlian</h1>
            <p>
              ASTRAtech memiliki banyak program studi, di dalam program studi
              terdapat kelompok keahlian yang biasa disebut dengan Kelompok
              Keahlian
            </p>
            <div className="input-wrapper">
              <div
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
                  ref={searchQuery}
                  forInput="pencarianKK"
                  placeholder="Cari Kelompok Keahlian"
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
                  onClick={handleSearch}
                  style={{ backgroundColor: "transparent", color: "#08549F" }}
                />
              </div>
            </div>
          </div>

          <div className="navigasi-layout-page">
            <p className="title-kk">Kelompok Keahlian</p>
            <div className="left-feature">
              <div className="status" style={{ display: "flex" }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <i
                          className="fas fa-circle"
                          style={{ color: "#FFC107" }}
                        ></i>
                      </td>
                      <td>
                        <p>Menunggu Persetujuan Prodi</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="" style={{ marginLeft: "20px" }}>
                  <Filter handleSearch={handleSearch}>
                    <DropDown
                      ref={searchFilterSort}
                      forInput="ddUrut"
                      label="Urut Berdasarkan"
                      type="none"
                      arrData={dataFilterSort}
                      defaultValue="[Nama Kelompok Keahlian] asc"
                    />
                  </Filter>
                </div>
              </div>
            </div>
          </div>

          <>
            <div className="d-flex flex-column">
              {dataAktif ? (
                <div className="flex-fill">
                  <div
                    className="text-white fw-medium"
                    style={{
                      padding: "10px",
                      backgroundColor: "#0E6EFE",
                      marginLeft: "70px",
                      width: "25%",
                      borderRadius: "10px",
                    }}
                  >
                    ↓ Terdaftar sebagai anggota keahlian
                  </div>
                  <div className="card" style={{ margin: "10px 65px" }}>
                    <div className="card-body p-3">
                      <div className="row">
                        <div className="col-lg-7 pe-4">
                          <img
                            src={`${API_LINK}Upload/GetFile/${dataAktif["Gambar"]}`}
                            alt=""
                            style={{
                              width: "100%",
                              borderRadius: "20px",
                              marginBottom: "20px",
                            }}
                          />
                          <h3
                            className="mb-3 fw-semibold"
                            style={{ color: "#0A5EA8" }}
                          >
                            {dataAktif["Nama Kelompok Keahlian"]}
                          </h3>
                          <h5 className="fw-semibold mb-4">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="icon-style mr-2"
                            />
                           PIC : {dataAktif?.PIC}
                          </h5>
                          <h5 className="fw-semibold">
                            <FontAwesomeIcon
                              icon={faGraduationCap}
                              className="icon-style mr-2"
                            />
                            {dataAktif?.Prodi}
                          </h5>
                          <p
                            className="pt-3"
                            style={{
                              textAlign: "justify",
                            }}
                          >
                            {dataAktif?.Deskripsi}
                          </p>
                        </div>
                        <div className="col-lg-5 ps-4 border-start">
                          <h5 className="fw-semibold mt-1">
                            Lampiran pendukung
                          </h5>
                          <div className=" ">
                            {detail?.map((item, index) => (
                              <div key={index}>
                                {item.Lampiran ? (
                                  // Check if Lampiran is a string before splitting
                                  Array.isArray(item.Lampiran) ? (
                                    item.Lampiran.map((link, linkIndex) => (
                                      <div key={linkIndex}>
                                        <h5
                                          className="mb-3"
                                          style={{ marginTop: "15px" }}
                                        >{`Lampiran ${linkIndex + 1}`}</h5>
                                        <a
                                          href={link.trim()}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            padding: "5px",
                                            marginTop: "20px",
                                            textDecoration: "none",
                                            borderRadius: "10px",
                                            color: "white",
                                            backgroundColor: "#0A5EA8",
                                          }}
                                        >
                                          {`Lampiran ${linkIndex + 1} ${
                                            dataAktif["Nama Kelompok Keahlian"]
                                          }`}
                                        </a>
                                      </div>
                                    ))
                                  ) : typeof item.Lampiran === "string" ? (
                                    item.Lampiran.split(",").map(
                                      (link, linkIndex) => (
                                        <div key={linkIndex}>
                                          <h5 className="mb-3">{`Lampiran ${
                                            index + 1
                                          }`}</h5>
                                          <a
                                            href={link.trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {`Lampiran ${linkIndex + 1} ${
                                              dataAktif[
                                                "Nama Kelompok Keahlian"
                                              ]
                                            }`}
                                          </a>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p>Invalid Lampiran format</p>
                                  ) // Handle non-string cases
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
                  <div
                    className="text-white fw-medium"
                    style={{
                      padding: "10px",
                      backgroundColor: "#A7AAAC",
                      marginLeft: "70px",
                      width: "25%",
                      borderRadius: "10px",
                    }}
                  >
                    ↓ Kelompok Keahlian Lainnya
                  </div>
                  <div className="card" style={{ margin: "20px 65px" }}>
                    <div className="card-body p-3">
                      <div className="row mt-0 gx-4">
                        {console.log("das", listKK)}
                        {listKK
                          ?.filter((value) => {
                            return (
                              value.Status !== "Aktif" &&
                              value.Status !== "Tidak Aktif" 
                            );
                          })
                          .map((value, index) => (
                            <CardPengajuanBaru
                              key={index}
                              data={value}
                              onChangePage={onChangePage}
                              style={{ marginRight: "-20px" }}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!isLoading &&
                  (listKK.length === 0 ||
                    listKK.every((value) => value.Status === "None")) ? (
                    <>
                      <div
                        className=""
                        style={{ marginLeft: "80px", marginRight: "80px" }}
                      >
                        <Alert
                          type="warning mt-3"
                          message="Tidak ada data! Silahkan cari kelompok keahlian diatas.."
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-fill">
                      <div className="container">
                        {listKK.filter(
                          (value) => value.Status === "Menunggu Acc"
                        ).length == 2 && (
                          <Alert
                            type="info mt-2 ml-3 mr-3"
                            message="Anda hanya bisa mendaftar pada 2 Kelompok Keahlian. Tunggu konfirmasi dari prodi.."
                          />
                        )}
                        <div
                          className="card-keterangan"
                          style={{
                            background: "#FFC107",
                            borderRadius: "5px",
                            padding: "10px 20px",
                            width: "40%",
                            marginLeft: "20px",
                            marginBottom: "20px",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          ↓ Menunggu Persetujuan Prodi
                        </div>
                        {listKK.filter(
                          (value) => value.Status === "Menunggu Acc"
                        ).length == 0 && (
                          <Alert
                            type="warning mt-2 mr-4 ml-4"
                            message="Anda belum melakukan pengajuan"
                          />
                        )}
                        <div
                          className="row mt-3 gx-4"
                          style={{ marginLeft: "5px" }}
                        >
                          {listKK
                            ?.filter((value) => {
                              return value.Status === "Menunggu Acc";
                            })
                            .map((value, index) => (
                              <CardPengajuanBaru
                                key={index}
                                data={value}
                                onChangePage={onChangePage}
                              />
                            ))}
                        </div>
                        <div
                          className="card-keterangan"
                          style={{
                            background: "#61A2DC",
                            borderRadius: "5px",
                            padding: "10px 20px",
                            width: "40%",
                            marginLeft: "20px",
                            marginBottom: "20px",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          ↓ Kelompok Keahlian Lainnya
                        </div>
                        {console.log("adsa", listKK)}
                        {listKK.filter(
                          (value) =>
                            value.Status != "Menunggu Acc" &&
                            value.Status !== "Tidak Aktif"
                        ).length == 0 && (
                          <Alert
                            type="warning mt-2 mr-4 ml-4"
                            message="Belum ada kelompok Keahlian"
                          />
                        )}
                        <div
                          className="row mt-3 gx-4"
                          style={{ marginLeft: "5px" }}
                        >
                          {listKK
                            ?.filter((value) => {
                              return value.Status !== "Menunggu Acc";
                            })
                            .map((value, index) => (
                              <>
                                <CardPengajuanBaru
                                  key={index}
                                  data={value}
                                  onChangePage={onChangePage}
                                />
                                {console.log("dataa", value)}
                              </>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        </main>
      </div>
    </>
  );
}
