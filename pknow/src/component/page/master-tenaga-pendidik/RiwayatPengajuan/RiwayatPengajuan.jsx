import React from "react";
import { useEffect, useRef, useState } from "react";
import UseFetch from "../../../util/UseFetch";
import Input from "../../../part/Input";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import CardPengajuanBaru from "../../../part/CardPengajuanBaru";
import Button2 from "../../../part/Button copy";
import "../../../../../src/index.css";
import "../../../../style/Search.css";

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

  const dataFilterSort = [
    { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
    {
      Value: "[Nama Kelompok Keahlian] desc",
      Text: "Nama Kelompok Keahlian  [↓]",
    },
  ];
  

export default function RiwayatPengajuan({onChangePage}) {
    let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [show, setShow] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataAktif, setDataAktif] = useState(false);
  const [listKK, setListKK] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal] DESC",
    kry_id: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterKry = useRef(); 

  function handleSearch() {
    if (!currentFilter.kry_id) {
      console.error("kry_id belum diatur. Tidak dapat melanjutkan pencarian.");
      return;
    }
  
    setIsLoading(true);
  
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current?.value || "", // Gunakan nilai kosong jika undefined
      sort: searchFilterSort.current?.value || "[Nama Kelompok Keahlian] asc",
      kry_id: currentFilter.kry_id, // Pastikan kry_id digunakan
    }));
  
  }
  
  

  const getUserKryID = async () => {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
  
    try {
      while (true) {
        const data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });
  
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const user = data[0];
          setUserData(user);
  
          // Perbarui filter dengan kry_id dari hasil API
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            kry_id: user.kry_id,
          }));
  
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      console.error("Error saat mengambil kry_id:", error);
      setIsLoading(false);
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

  const getRiwayat = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    if (currentFilter.kry_id === "") return;

    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "PengajuanKK/GetRiwayat",
          currentFilter
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data === "data kosong") {
          setListKK([]);
          setIsLoading(false);
          break;
        } else {
         
          setListKK(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setListKK([]);
    }
  };

  useEffect(() => {
    getRiwayat();
  }, [currentFilter]);

    return (
        <div className="app-container">
            {/* Render Header */}
            <main>
            <div className="backSearch">
          <h1>Riwayat Pengajuan</h1>
          <p>
          Riwayat Pengajuan akan menampilkan pengajuan anggota keahlia yang anda ajukan, hanya terdapat satu kelompok keahlian yang pengajuannya akan diterima oleh Program Studi.
          </p>
          {/* <div className="input-wrapper">
            <div
              className=""
              style={{
                display: "flex",
                backgroundColor: "white",
                borderRadius: "20px",
                height: "40px",
              }}
            >
             <Input
                ref={searchQuery}
                forInput="pencarianKK"
                placeholder="Cari"
                style={{
                  border: "none",

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
          </div> */}

<div className="input-wrapper">
              <div
                className="cari"
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: "20px",
                  height: "40px",
                }}
              >
                <Input
                  ref={searchQuery}
                  forInput="pencarianKK"
                  placeholder="Cari Riwayat Pengajuan"
                  style={{
                    border: "none",
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
                 <>
                 <div className="container">
      <div className="d-flex flex-column">
      <div className="navigasi-layout-page">
          <p className="title-kk">Kelompok Keahlian</p>
          <div className="left-feature">
            <div className="status">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <i
                        className="fas fa-circle"
                        style={{ color: "grey" }}
                      ></i>
                    </td>
                    <td>
                      <p>Dibatalkan</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <i className="fas fa-circle" style={{ color: "#DC3545" }}></i>
                    </td>
                    <td>
                      <p>Ditolak</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="tes" style={{ display: "flex" }}>
              <div className="">
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
              </div>
          
          <div className="container">
            <div className="row mb-4 gx-4">
            {Array.isArray(listKK) && listKK.length > 0 && listKK[0]?.Message ? (
              <div className="" style={{marginRight:"120px"}} >
  <Alert type="warning" message="Tidak ada riwayat.." />
  </div>
) : (
 
 listKK
    ?.filter((value) => value.Status === "Dibatalkan" || value.Status === "Ditolak")
    .map((value) => (
      <CardPengajuanBaru
        key={value.Key}
        data={value}
        onChangePage={onChangePage}
      />
    ))
)}
            </div>
          </div>
        </div>
    </>

            </main>
        </div>
    );
}
