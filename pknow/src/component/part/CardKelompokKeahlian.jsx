import React from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import "../../style/KelompokKeahlian.css";
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

function CardKelompokKeahlian({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    prodi: { key: "", nama: "" },
    pic: { key: "", nama: "" },
    desc: "",
    status: "",
    gambar:"",
  },
  ketButton,
  colorCircle,
  iconClass,
  showDropdown = true,
  showStatusText = true,
  showProdi = true,
  showUserProdi = true,
  anggota,
  statusPersetujuan,
  onClick,
  onChangePage,
  onChangeStatus,
  onDelete,
  title,
  showMenu=true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);


  const handleStatusChange = (newStatus, status) => {
    if (onChangeStatus) {
      onChangeStatus(newStatus, status);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(data.id);
    }
  };

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Limit the description to 100 characters if not expanded
  const truncatedDesc =
    data.desc.length > 100 && !isExpanded
      ? `${data.desc.substring(0, 100)}...`
      : data.desc;


      let footerStatus;
      if (data.status === "Draft" && !data.pic.key) {
        footerStatus = (
          <p className="mb-0 text-secondary"><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />Draft - Belum dikirimkan ke Prodi</p>
        );
      } else if (data.status === "Draft" && data.pic.key) {
        footerStatus = (
          <p className="mb-0 text-secondary"><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />Draft - Belum dipublikasi</p>
        );
      } else if (data.status === "Menunggu") {
        footerStatus = (
          <p className="mb-0 text-secondary" ><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />Menunggu PIC dari Prodi</p>
        );
      } else if (data.status === "Aktif" && data.pic.key){
        footerStatus = (
          <p className="mb-0 text-secondary"><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        /><span style={{marginRight:"50px"}}>Aktif</span></p>
        );
      } else if (data.status === "Tidak Aktif" && data.pic.key){
        footerStatus = (
          <p className="mb-0 text-secondary"><i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: "red",
            marginRight: "20px",
            width: "10px",
          }}
        />Tidak Aktif</p>
        );
      }

      const members = data.members || []; // memastikan members selalu berupa array


      let personInCharge;
      if (data.status === "Draft" && !data.pic.key) {
        personInCharge = (
          <div className=" d-flex">
            <FontAwesomeIcon icon={showUserProdi ? faUser : faClock} className="icon-style" />
            <p className="text-gray-700" style={{ fontSize:"15px"}}>{" "}
            PIC : Belum ada PIC KK
            </p>
          </div>
        );
      } else {
        personInCharge = (
          <div className="d-flex" >
           <FontAwesomeIcon icon={showUserProdi ? faUser : faClock} className="icon-style" />
              <p className="text-gray-700" style={{ fontSize:"15px"}}>
              PIC :{" "}
              {data.pic.key ? (
                data.pic.nama
              ) : (
                <span className=" " style={{ fontSize:"15px",color:"black", fontWeight:"600"}}>
                  Menunggu PIC dari Prodi
                </span>
              )}
           </p>
          </div>
        );
      }


      let cardContent;
      if (config.footer === "Btn") {
        cardContent = (
          <div className="d-flex justify-content-between">
            <div className=""></div>
            <div className="">
            <Button
              iconName={config.icon}
              classType={config.className + 'py-2 mt-3'}
              label={config.label}
              onClick={() => onChangePage("add", data)}
              style={{border:"none"}}
            />
            </div>
          </div>
        );
      } else if (config.footer === "Draft") {
        cardContent = (
          <div className="d-flex justify-content-between">
           {showStatusText ? (
                    <div className="">
                      <span style={{ fontSize: "14px" }}>{footerStatus}</span>
                    </div>
                  ) : (
                    <a href="#selengkapnya" className="text-blue-600" style={{ textDecoration: "none" }}>
                      Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  )}
            <div className="d-flex justify-content-end" style={{marginTop:"17px", marginLeft:"-20px"}}>
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("edit", data)}
                style={{border:"none"}}
              />
              <Icon
                name="trash"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Hapus data permanen"
                onClick={() => handleDeleteClick(data)}
                style={{border:"none"}}
              />
              <Icon
                name="list"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Lihat detail Kelompok Keahlian"
                onClick={() => onChangePage("detailDraft", data)}
                style={{border:"none"}}
              />
              {data.pic.key ? (
                <Icon
                  name="paper-plane"
                  type="Bold"
                  cssClass="btn px-1 py-0 text-primary"
                  title="Publikasi Kelompok Keahlian"
                  onClick={() => handleStatusChange(data, 'Aktif')}
                  style={{border:"none"}}
                />
              ) : (
                <Icon
                  name="paper-plane"
                  type="Bold"
                  cssClass="btn px-1 py-0 text-primary"
                  title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
                  onClick={() => handleStatusChange(data, "Menunggu")}
                  style={{border:"none"}}
                />
              )}
            </div>
          </div>
        );
      } else if (config.footer === "Menunggu") {
        cardContent = (
          <div className="d-flex justify-content-between">
            {showStatusText ? (
                    <div className="" style={{display:"flex"}}>
                   {footerStatus}
                    </div>
                  ) : (
                    <a href="#selengkapnya" className="text-blue-600" style={{ textDecoration: "none" }}>
                      Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  )}
            <div className="d-flex justify-content-end" style={{marginTop:"20px"}}>
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("edit", data)}
              />
              {/* <Icon
                name="trash"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Hapus data permanen"
              /> */}
              <Icon
                name="list"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Lihat detail Kelompok Keahlian"
                onClick={() => onChangePage("detailDraft", data)}
              />
              {data.pic.key ? (
                <Icon
                  name="paper-plane"
                  type="Bold"
                  cssClass="btn px-1 py-0 text-primary"
                  title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
                />
              ) : (
                ""
              )}
            </div>
          </div>
        );
      } else {
        cardContent = (
          <div className="d-flex justify-content-between" style={{width:"100%"}}>
            {showStatusText ? (
                    <div className="" style={{width:"100%" }}>
                      <span style={{ fontSize: "14px"}}>{footerStatus}</span>
                    </div>
                  ) : (
                    <a href="#selengkapnya" className="text-blue-600" style={{ textDecoration: "none" }}>
                      Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  )}
            <div className="d-flex" style={{ width: "10%", marginTop:"15px" }}>
            {showMenu ? (
    <>
      <Icon
        name="edit"
        type="Bold"
        cssClass="btn px-2 py-0 text-primary"
        title="Ubah data"
        onClick={() => onChangePage("edit", data)}
      />
      <Icon
        name="list"
        type="Bold"
        cssClass="btn px-2 py-0 text-primary"
        title="Lihat detail Kelompok Keahlian"
        onClick={() => onChangePage("detailPublish", data)}
      />
      <div
        className="form-check form-switch py-0 ms-2"
        style={{ width: "fit-content" }}
      >
        <Input
          type="checkbox"
          title="Aktif / Nonaktif"
          className="form-check-input"
          checked={data.status === "Aktif"}
          onChange={() =>
            handleStatusChange(
              data,
              data.status === "Aktif" ? "Tidak Aktif" : "Aktif"
            )
          }
        />
        <label
          className="form-check-label"
          htmlFor="flexSwitchCheckDefault"
        ></label>
      </div>
    </>
  ) : <div className=""> {ketButton && (
    <div className="d-flex justify-content-end" style={{marginLeft:"-60px"}}>
        <button
          className="bg-blue-100 text-white px-6 rounded-full d-flex align-items-center"
          aria-label={`Action for ${title}`}
          style={{ width: "180px" }}
          onClick={() => onChangePage("add", data)}
        >
          <i className="fas fa-users" style={{ marginRight: "10px", marginTop: "2px" }}></i>
          {ketButton}
        </button>
      </div>
  )}</div>}
            </div>
          </div>
        );
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
              <h3 className="text-xl font-bold text-blue-600" style={{ fontSize: "20px", textAlign: "justify" }}>
                {data.title}
              </h3>
            </div>
        </div>

        <div className="pemilik ">
            <div className="prodi" style={{fontSize:"14px"}}>
              <FontAwesomeIcon icon={showProdi ? faGraduationCap : faPeopleGroup} className="icon-style" />
              <p className="text-gray-700" style={{ marginLeft: "15px", width:"100%", fontSize:"15px" }}>
                {showProdi ? data.prodi.nama : anggota}
              </p>
            </div>
            <div className="userProdi">
              {personInCharge}
            </div>
        </div>

        <div className="deskripsi-container " style={{ alignItems: "center", width:"100%" }}>
              <p className="deskripsi" style={{ marginBottom: "10px" }}>
                {truncatedDesc}{" "}
                {data.desc.length > 50 && (
                  <button
                    onClick={toggleDescription}
                    className="text-blue-600"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "15px",
                      color: "#0E6EFE",
                      padding: 0,
                    }}
                  >
                    {isExpanded ? "Lihat Sedikit" : "Selengkapnya"}
                  </button>
                )}
              </p>
        </div>

        <div className="card-footer status-open mb-4 mr-3 ml-3">
                    <div className="card-content" style={{alignItems:"center"}}>
                    {cardContent}
                    </div>
        </div>
      </div>
    </div>
  );
}

export default CardKelompokKeahlian;