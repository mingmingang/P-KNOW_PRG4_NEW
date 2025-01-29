import React, { useEffect, useState } from "react";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import Icon from "../../../part/Icon";
import CardKK from "../../../part/CardKelompokKeahlian2";
import { API_LINK } from "../../../util/Constants";
import AppContext_test from "../master-test/TestContext";
import Search from "../../../part/Search";

export default function SubKKIndex({ onChangePage }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [listKK, setListKK] = useState([]);

  const getKKAndPrograms = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        let kryId = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          p1: AppContext_test.activeUser,
        });
        AppContext_test.karyawanId = kryId[0].kry_id;
        setIsError({ error: false, message: "" });
        setIsLoading(true);

        let kkData = await UseFetch(API_LINK + "Program/GetDataKKByAKK", {
          p1: AppContext_test.activeUser,
        });
  
        if (kkData === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data Kelompok Keahlian."
          );
        }

        const kkWithPrograms = [];

        for (const kk of kkData) {
          const programData = await UseFetch(
            API_LINK + "Program/GetProgramByKK",
            { kk: kk.Key }
          );

          console.log("dataa programamm", programData)

          if (programData === "ERROR") {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
          }

          const anggotaCountData = await UseFetch(
            API_LINK + "Program/CountAnggotaByKK",
            { p1: kk.Key }
          );

          if (anggotaCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const anggotaCount = anggotaCountData.length;

          const programCountData = await UseFetch(
            API_LINK + "Program/CountProgramByKK",
            { p1: kk.Key }
          );

          if (programCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const programCount = programCountData.length;

          const programsWithCategories = [];

          for (const program of programData) {
            const categoryData = await UseFetch(
              API_LINK + "Program/GetKategoriByProgram",
              { p1: program.Key,
                p2: '',
                p3: '',
                p4: 'Aktif'
              }
            );

            const categoriesWithMaterialCounts = await Promise.all(
              categoryData.map(async (category) => {
                const materialCountData = await UseFetch(
                  API_LINK + "Program/CountMateriByKategori",
                  { p1: category.Key }
                );
                return { ...category, materialCount: materialCountData.length };
              })
            );

            programsWithCategories.push({
              ...program,
              categories: categoriesWithMaterialCounts,
            });
          }

          kkWithPrograms.push({
            ...kk,
            programs: programsWithCategories,
            AnggotaCount: anggotaCount,
            ProgramCount: programCount,
          });
        }

        setListKK(kkWithPrograms);
        setIsLoading(false);
        return kkWithPrograms;
      } catch (error) {
        console.error("Error fetching KK and Programs data:", error);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          setIsLoading(false);
          throw error;
        }
      }
    }
  };
  
  const isDataReadyTemp = "";
  const materiIdTemp = "";
  const isOpenTemp = true;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await getKKAndPrograms(); // Call the updated function
        if (isMounted) {
          setListKK(data); // Update listKK state
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
        }
        console.error("Fetch error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // useEffect(() => {
  //   getKKAndPrograms();
  // }, []);

  return (
    <>
      {/* {isLoading && <Loading />} */}
      <Search
        title="Kelola Materi"
        description="Program ini terdiri dari berbagai kategori yang dirancang untuk mempermudah pengelompokan materi sesuai dengan topik atau tema tertentu. Setiap kategori memiliki sejumlah materi yang dapat Anda kelola secara fleksibel, mulai dari menambah, mengedit, hingga menghapus materi sesuai kebutuhan."
        showInput={false}
      />
      {isError.error && <Alert type="danger" message={isError.message} />}
      <div className="d-flex flex-column">
        {listKK.length === 0 ? (
          <div className="mx-5 my-5">
          <Alert type="warning" message="Anda tidak tergabung pada Program Kelompok Keahlian manapun saat ini." />
          </div>
        ) : (
          listKK.map((kk, index) => (
            <CardKK key={index} kk={kk} onChangePage={onChangePage} />
          ))
        )}
      </div>
    </>
  );
  
}
