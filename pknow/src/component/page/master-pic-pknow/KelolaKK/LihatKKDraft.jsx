import { useState, useEffect } from "react";
import Button from "../../../part/Button";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import Filter from "../../../part/Filter";
import Icon from "../../../part/Icon";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import NoImage from "../../../../assets/NoImage.png";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

export default function KKDetailDraft({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listAnggota, setListAnggota] = useState([]);
  const [listProgram, setListProgram] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

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

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
    members: [],
    memberCount: "",
    gambar: "",
  });

  const getListAnggota = async () => {
    console.log("heree");
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] asc",
          status: "Aktif",
          kke_id: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListProgram = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgram", {
          page: 1,
          query: "",
          sort: "[Nama Program] ASC",
          status: "Aktif",
          KKid: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data program.");
        } else if (data === "data kosong") {
          setListProgram([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const updatedListProgram = await Promise.all(
            data.map(async (program) => {
              try {
                while (true) {
                  let data = await UseFetch(
                    API_LINK + "KategoriProgram/GetKategoriByProgram",
                    {
                      page: 1,
                      query: "",
                      sort: "[Nama Kategori] asc",
                      status: "Aktif",
                      kkeID: program.Key,
                    }
                  );

                  if (data === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal mengambil data kategori."
                    );
                  } else if (data === "data kosong") {
                    return { ...program, kategori: [] };
                  } else if (data.length === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                  } else {
                    return { ...program, kategori: data };
                  }
                }
              } catch (e) {
                console.log(e.message);
                setIsError({ error: true, message: e.message });
                return { ...program, kategori: [] }; // Handle error case by returning program with empty kategori
              }
            })
          );

          console.log(updatedListProgram);
          setListProgram(updatedListProgram);
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
    if (withID) {
      setFormData({
        key: withID.id,
        nama: withID.title,
        programStudi: withID.prodi.nama,
        personInCharge: withID.pic.nama,
        deskripsi: withID.desc,
        status: withID.status,
        members: withID.members,
        memberCount: withID.memberCount,
        gambar: withID.gambar,
      });
      getListAnggota();
      getListProgram();
    }
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div
        className="back-and-title"
        style={{ display: "flex", marginLeft: "80px", marginTop: "100px" }}
      >
        <button
          style={{ backgroundColor: "transparent", border: "none" }}
          onClick={handleGoBack}
        >
          <img src={BackPage} alt="" />
        </button>
        <h4
          style={{
            color: "#0A5EA8",
            fontWeight: "bold",
            fontSize: "30px",
            marginTop: "10px",
            marginLeft: "20px",
          }}
        >
          Kelompok Keahlian
        </h4>
      </div>
      <div className="ket-draft"></div>
      <div className="card" style={{ margin: "10px 140px", border: "none" }}>
        <div className="card-body">
          <div className="row pt-2">
            <div className="col-lg-7 px-4">
              <h3
                className="mb-3 fw-semibold"
                style={{ fontSize: "30px", color: "#0A5EA8", fontWeight:"bold" }}
              >
                {formData.nama}
              </h3>
              <h5 className="fw-semibold">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="icon-style"
                  style={{ marginRight: "10px" }}
                />
                {formData.programStudi}
              </h5>
              <h4 className="fw-semibold" style={{ marginTop: "30px" }}>
                Tentang Kelompok Keahlian
              </h4>
              <p
                className="py-2"
                style={{ textAlign: "justify", width: "500px" }}
              >
                {formData.deskripsi}
              </p>
              <div className="">
                <i className="fas fa-user"></i>
                <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                  PIC : {formData.personInCharge}
                </span>
              </div>
            </div>
            <div className="col-lg-5">
              <img
                alt={`image`}
                className="cover-daftar-kk"
                height="200"
                src={`${API_LINK}Upload/GetFile/${formData.gambar}`}
                width="300"
                style={{
                  width: 500,
                  height: 250,
                  borderRadius: "20px",
                
                  backgroundSize: "cover",
                }}
              />
            </div>
          </div>
        </div>
        <div className="status" style={{marginTop:"40px", marginBottom:"60px"}}>
          <h4 style={{fontWeight:"bold", color:"#0A5EA8", textAlign:"center"}}>Status Kelompok Keahlian ini : {formData.status}</h4>
        </div>
      </div>

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
    </>
  );
}
