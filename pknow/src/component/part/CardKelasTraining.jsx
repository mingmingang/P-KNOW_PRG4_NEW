import React from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import "../../style/KelompokKeahlian.css";
import { decode } from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import developerImage from "../../assets/developer.png";
import { API_LINK } from "../util/Constants";
import { useState } from "react";
import Input from "./Input";
import Swal from "sweetalert2";
import UseFetch from "../util/UseFetch";

function CardKelasTraining({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    desc: "",
    status: "",
    gambar: "",
    ProgramStudi: "",
    publikasi: "",
  },
  onChangePage,
  title,
  harga = 0,
  detailProgram,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedDesc =
    data.desc.length > 100 && !isExpanded
      ? `${decode(data.desc.substring(0, 100))}...`
      : decode(data.desc);
  let cardContent;
  if (detailProgram == "ya") {
    cardContent = (
      <div className="d-flex justify-content-end">
        <div style={{ marginLeft: "175px" }}>
          <Button
            iconName="info" // Cocok untuk "Detail Kelas"
            classType={`${config.className} py-2 mt-3`}
            label="Detail Program"
            onClick={() => onChangePage("detailprogram", data)}
            style={{ border: "none", width: "200px", marginLeft:"-40px" }}
          />
        </div>
      </div>
    );
  } else {
    if (data.publikasi !== "Terpublikasi") {
      cardContent = (
        <div className="d-flex justify-content-between">
          <div>
            <Button
              iconName="info" // Cocok untuk "Detail Kelas"
              classType={`${config.className} py-2 mt-3`}
              label="Detail Kelas"
              onClick={() => onChangePage("detail", data)}
              style={{ border: "none" }}
            />
          </div>
          <div className="ml-4">
            <Button
              iconName="upload" // Cocok untuk "Publikasi Kelas"
              classType={`${config.className} py-2 mt-3`}
              label="Publikasi Kelas"
              onClick={() => onChangePage("publikasi", data)}
              style={{ border: "none" }}
            />
          </div>
        </div>
      );
    } else {
      cardContent = (
        <div className="d-flex justify-content-between">
          <div>
            <Button
              iconName="info" // Cocok untuk "Detail Kelas"
              classType={`${config.className} py-2 mt-3`}
              label="Detail Kelas"
              onClick={() => onChangePage("detail", data)}
              style={{ border: "none" }}
            />
          </div>
          <div className="ml-4">
            <Button
              iconName="ban" // Cocok untuk "Batal Publikasi Kelas"
              classType={`${config.className} py-2 mt-3`}
              label="Batal Publikasi"
              onClick={() => {
                Swal.fire({
                  title: "Apakah Anda yakin?",
                  text: "Anda akan membatalkan publikasi kelas ini!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Ya, batalkan!",
                  cancelButtonText: "Tidak",
                }).then((result) => {
                  if (result.isConfirmed) {
                    UseFetch(API_LINK + "Program/BatalkanPublikasi", {
                      idProgram: data.id,
                    })
                      .then((responseData) => {
                        Swal.fire(
                          "Dibatalkan!",
                          "Publikasi kelas telah dibatalkan.",
                          "success"
                        );
                        window.location.reload();
                      })
                      .catch((error) => {
                        console.error("Error:", error);
                      })
                      .finally(() => setIsLoading(false));
                  }
                });
              }}
              style={{
                border: "none",
                backgroundColor: "red",
                color: "white",
              }}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="kelompokKeahlian">
      <div className="bg-white-kk">
        <img
          alt={`${title} image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.gambar}`}
          width="300"
        />

        <div className="row">
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h3
              className="text-xl font-bold text-blue-600"
              style={{ fontSize: "17px" }}
            >
              {decode(data.title)}
            </h3>
          </div>
        </div>

        <div className="pemilik ">
          <div className="prodi" style={{ fontSize: "14px", color: "#4D4D4D" }}>
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="icon-style"
              style={{ fontSize: "20px" }}
            />
            <p
              className="700"
              style={{
                marginLeft: "15px",
                width: "100%",
                fontSize: "14px",
                color: "#4D4D4D",
              }}
            >
              {data.ProgramStudi}
            </p>
          </div>
        </div>
        {data.cek === "dapat akses" ? (
          <div className="pemilik">
    <div className="prodi" style={{ fontSize: "14px", color: "#4D4D4D" }}>
    <i
      className="fas fa-user"
      style={{ fontSize: "20px", paddingLeft: "5px" }}
    ></i>
    <p
      className="700 ml-3"
      style={{
        marginLeft: "15px",
        width: "100%",
        fontSize: "14px",
        color: "#4D4D4D",
      }}
    >
    {data.PIC}
    </p>
  </div>
  </div>
 
) : (
  <div className="pemilik">
    <div className="prodi" style={{ fontSize: "14px", color: "#4D4D4D" }}>
      <i
        className="fas fa-tag"
        style={{ fontSize: "20px", paddingLeft: "5px" }}
      ></i>
      <p
        className="700 ml-3"
        style={{
          marginLeft: "15px",
          width: "100%",
          fontSize: "14px",
          color: "#4D4D4D",
        }}
      >
        {data.publikasi && data.publikasi === "Terpublikasi" ? (
          data.harga && data.harga > 0 ? (
            <div
              style={{
                color: "red",
                fontWeight: "bold",
              }}
            >
              Rp.{" "}
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              })
                .format(data.harga)
                .replace("Rp", "")
                .trim()}
            </div>
          ) : (
            <div
              style={{
                color: "green",
                fontWeight: "bold",
              }}
            >
              Gratis
            </div>
          )
        ) : (
          <div
            style={{
              color: "orange",
              fontWeight: "bold",
            }}
          >
            Belum Dipublikasi
          </div>
        )}
      </p>
    </div>
  </div>
)}

       
        <div
          className="deskripsi-container "
          style={{ alignItems: "center", width: "100%", marginLeft:"20px", marginRight:"20px" }}
        >
          <p
            className="deskripsi"
            style={{ marginBottom: "10px", fontSize: "15px", marginRight:"35px" }}
          >
            {decode(data.desc).substring(0, 130)}
            {/* Menampilkan 200 huruf pertama */}
            {data.desc.length > 130 && "..."}
          </p>
        </div>

        <div className="card-footer status-open mb-4 mr-3 ml-3">
          <div className="card-content" style={{ alignItems: "center" }}>
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardKelasTraining;
