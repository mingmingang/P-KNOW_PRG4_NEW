import Search from "../../../part/Search";
import KelompokKeahlian from "../../../part/KelompokKeahlian";
import developerImage from "../../../../assets/developer.png";
import "../../../../index.css";

import React, { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import DropDown from "../../../part/Dropdown";
import Filter from "../../../part/Filter";
import CardKonfirmasi from "../../../part/CardKonfirmasi";
import Icon from "../../../part/Icon";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import axios from "axios";

export default function PersetujuanAnggotaKK({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);

  const getListKK = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KK/GetDataKKbyProdi");
        console.log("data kk", data);
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } 
        // else if (data.length === 0) {
        //   await new Promise((resolve) => setTimeout(resolve, 2000));
        // }
         else {
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

  useEffect(() => {
    getListKK();
  }, []);

  return (
    <>
      <div className="app-container">
        <main>
          <Search
            title="Persetujuan Anggota Keahlian"
            description="Program Studi dapat menyetujui persetujuan pengajuan anggota keahlian yang diajukan oleh Tenaga Pendidik untuk menjadi anggota dalam Kelompok Keahlian. Program Studi dapat melihat lampiran pengajuan dari Tenaga Pendidik untuk menjadi bahan pertimbangan"
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />

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
                    <tr>
                      <td>
                        <i
                          className="fas fa-circle"
                          style={{ color: "#FFC619" }}
                        ></i>
                      </td>
                      <td>
                        <p>Menunggu Persetujuan</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <>
            {isLoading ? (
              <Loading />
            ) : (
              <div className="d-flex flex-column">
                {isError.error && (
                  <div className="flex-fill">
                    <Alert type="danger" message={isError.message} />
                  </div>
                )}

                <div className="container">
                  <div className="row mt-0 gx-4 mb-4">
                    {currentData.filter((value) => {
                      return value.Status === "Aktif";
                    }).length === 0 && (
                      <div className="" style={{ margin: "5px 20px" }}>
                        <Alert type="warning" message="Tidak ada data!" />
                      </div>
                    )}
                    {currentData
                      .filter((value) => {
                        return value.Status === "Aktif";
                      })
                      .map((value) => (
                        <CardKonfirmasi
                          key={value.Key}
                          data={value}
                          onChangePage={onChangePage}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        </main>
      </div>
    </>
  );
}
