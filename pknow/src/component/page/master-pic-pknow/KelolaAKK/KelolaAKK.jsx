import React, { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import "../../../../style/Beranda.css";
import Button2 from "../../../part/Button copy";
import "../../../../../src/index.css";
import CardKK from "../../../part/CardKelompokKeahlian";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import Paging from "../../../part/Paging";
import Input from "../../../part/Input";
import "../../../../style/Search.css";

const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
];

const dataFilterStatus = [
  { Value: "", Text: "Semua" },
  { Value: "Menunggu", Text: "Menunggu PIC Prodi" },
  { Value: "Draft", Text: "Draft" },
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];


export default function KelolaAKK({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Aktif",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    console.log(searchQuery.current.value);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
    }));
  }


  const getListKK = async () => {
    setIsError(false);
    try {
      let data = await UseFetch(API_LINK + "KK/GetDataKK", currentFilter);
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian.");
      } else if (data === "data kosong") {
        setCurrentData(data);
      } else {
        const formattedData = data.map((value) => {
          return {
            ...value,
            config: { footer: value.Status },
            data: {
              id: value.Key,
              title: value["Nama Kelompok Keahlian"],
              prodi: { key: value["Kode Prodi"], nama: value.Prodi },
              pic: { key: value["Kode Karyawan"], nama: value.PIC },
              desc: value.Deskripsi,
              status: value.Status,
              members: value.Members || [],
              memberCount: value.Count || 0,
              gambar: value.Gambar,
            },
          };
        });
        setCurrentData(formattedData);
      }
    } catch (e) {
      setIsError(true);
      console.log(e.message);
    }
  };
  
  
  useEffect(() => {
    getListKK();
  }, [currentFilter]);

  function handleDelete(id) {
    setIsError(false);
    SweetAlert("Konfirmasi Hapus", "Anda yakin ingin <b>menghapus permanen</b> data ini?", "warning", "Hapus").then((confirm) => {
      if (confirm) {
        UseFetch(API_LINK + "KK/DeleteKK", { idKK: id }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert("Sukses", "Data berhasil dihapus.", "success");
            handleSetCurrentPage(currentFilter.page);
          }
        });
      }
    });
  }

  function handleSetStatus(data, status) {
    setIsError(false);
    let message;
    if (data.status === "Draft" && !data.pic.key)
      message = "Apakah anda yakin ingin mengirimkan data ini ke Prodi?";
    else if (data.status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.status === "Aktif")
      message =
        "Apakah anda yakin ingin <b>menonaktifkan</b> data ini? <b>Semua anggota keahlian akan dikeluarkan secara otomatis</b> jika data ini dinonaktifkan";
    else if (data.status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";
    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        UseFetch(API_LINK + "KK/SetStatusKK", { idKK: data.id, status: status }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            let messageResponse;
            if (data[0].Status === "Menunggu") {
              messageResponse = "Sukses! Data sudah dikirimkan ke Prodi. Menunggu Prodi menentukan PIC Kelompok Keahlian..";
            } else if (data[0].Status === "Aktif") {
              messageResponse = "Sukses! Data berhasil dipublikasi. PIC Kelompok Keahlian dapat menentukan kerangka Program Belajar..";
            }
            SweetAlert("Sukses", messageResponse, "success");
            handleSetCurrentPage(currentFilter.page);
          }
        });
      }
    });
  }

  return (
    <div className="app-container">
      <main>
      <div className="backSearch">
      <h1>Kelola Anggota Kelompok Keahlian</h1>
      <p>ASTRAtech memiliki banyak program studi, di dalam program studi terdapat kelompok keahlian yang biasa disebut dengan Kelompok Keahlian</p>
        <div className="input-wrapper">
        <div className="" style={{width:"700px", display:"flex", backgroundColor:"white", borderRadius:"20px", height:"40px"}}>  
            <Input
              ref={searchQuery}
              forInput="pencarianKK"
              placeholder="Cari"
              style={{border:"none", width:"680px", height:"40px", borderRadius:"20px"}}
            />
          
            <Button2
              iconName="search"
              classType="px-4"
              title="Cari"
              onClick={handleSearch}
              style={{backgroundColor:"transparent", color:"#08549F"}}
            />
            </div>
        </div>
    </div>
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
                        style={{ color: "#4a90e2" }}
                      ></i>
                    </td>
                    <td>
                      <p>Aktif/Sudah Publikasi</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      <div className="container">
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
                ↓ Data Aktif / Sudah Dipublikasikan
              </div>
        {currentData.length === 0 ? (
          <div className="ml-3">
          <Alert type="warning" message="Tidak ada data!" />
          </div>
        ) : (
          <div className="row mt-0 gx-4">
          {currentData
            .filter(
              (value) =>
                value.config.footer !== "Draft" &&
                value.config.footer !== "Menunggu" &&
                value.config.footer !== "Tidak Aktif"
            )
            .map((value) => (
              <div className="col-md-4 mb-4" key={value.data.id}>
                <CardKK
                  key={value.data.id}
                  title="Data Scientist"
                  colorCircle="#61A2DC"
                  ketButton="Kelola Anggota"
                  config={value.config}
                  data={value.data}
                  onChangePage={onChangePage}
                  onChangeStatus={handleSetStatus}
                  showMenu={false}
                />
              </div>
            ))}
          </div>
        )}
     <div className="mb-4 d-flex justify-content-center">
      
      
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]?.Count || 0}
                navigation={handleSetCurrentPage}
              />
        
       
        </div>
      </div>
      </main>
    </div>
  );
}
