import React, { forwardRef } from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import Input from "./Input";
import { colors } from "@mui/material";
import { API_LINK } from "../util/Constants";
import { decode } from "html-entities";

const CardProgram = ({
  id,
  data,
  isActive,
  onClick,
  children,
  onChangePage,
  onChangeStatus,
  onDelete,
  index,
}) => {
  const handleStatusChange = (data, status) => {
    onChangeStatus(data, status);
  };

  const handleDeleteClick = (data) => {
    onDelete(data.Key);
  };

  return (
    <div
      id={id}
      className={`card card-program mt-3 ${isActive ? "border-primary" : ""}`}
    >
      {data.Status === "Draft" ? (
        <span
          className="text-danger bg-white px-2 ms-2 mb-0 fw-bold"
          style={{
            marginTop: "-12px",
            width: "fit-content",
            fontSize: "14px",
          }}
        >
          Draft
        </span>
      ) : (
        ""
      )}
      <div
        className={`card-body d-flex justify-content-between ${
          isActive ? "align-items-top border-bottom border-primary" : ""
        }`}
      >
        <img
          alt={`image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.Gambar}`}
          width="320"
          style={{marginRight:"20px", borderRadius:"20px", objectFit:"cover"}}
        />
        <div className="">
        <p
          className="fw-medium"
          style={{ width: "100%", borderRight: "solid grey 1px", backgroundColor:"#ABCCFF", borderRadius:"10px", padding:"5px 5px" }}
        >
          {index}
          {". "}
          {data["Nama Program"]}
        </p>
        <p
          className="mb-0 pe-3"
          style={{
            width: "100%",
            display: isActive ? "block" : "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textAlign: "justify",
          }}
        >
          {decode(data.Deskripsi)}
        </p>
        </div>
        
        <div
          className="d-flex ps-3"
        ><div className="d-flex">
          <div className="mt-3">
          {data.Status === "Draft" ? (
          <div
            className="d-flex justify-content-between align-items-center mr-3 "
            style={{
              background:"white", color:"#0A5EA8",  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", fontSize:"25px", padding:"2px 10px", borderRadius:"10px", height:"50px", marginTop:"-12px" 
            }}

          >
            <Icon
              name="edit"
              type="Bold"
              cssClass="btn px-2  py-0 text-primary"
              title="Ubah data"
              onClick={() => onChangePage("edit", data)}
              style={{borderRight:"1px solid grey", borderRadius:"0px"}}
            />
            <Icon
              name="trash"
              type="Bold"
              cssClass="btn px-2 py-0"
              title="Hapus data permanen"
              onClick={() => handleDeleteClick(data)}
              style={{borderRight:"1px solid grey", borderRadius:"0px", color:"red"}}
            />
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Publikasi program"
              onClick={() => handleStatusChange(data, "Aktif")}
            />
          </div>
        ) : (
          <div
            className="d-flex justify-content-between align-items-center px-3"
          >
            <Icon
              name="edit"
              type="Bold"
              cssClass="btn px-2 py-0 text-primary"
              title="Ubah data"
              onClick={() => onChangePage("edit", data)}
            />
            <div
              className="form-check form-switch py-0 ms-2"
              style={{ width: "fit-content" }}
            >
              <Input
                type="checkbox"
                className="form-check-input"
                checked={data.Status === "Aktif"}
                onChange={() =>
                  handleStatusChange(
                    data,
                    data.Status === "Aktif" ? "Tidak Aktif" : "Aktif"
                  )
                }
              />
              <label
                className="form-check-label"
                for="flexSwitchCheckDefault"
              ></label>
            </div>
          </div>
        )}
        </div>
        <div className="">
          <Button
            iconName={isActive ? "caret-up" : "caret-down"}
            classType="btn-sm px-2 rounded-3 mt-1"
            onClick={onClick}
            title="Detail Kelompok Keahlian"
            style={{background:"white", color:"#0A5EA8",  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", fontSize:"25px", padding:"5px 10px" }}
          />
          </div>
          </div>
        </div>
      </div>
      <div
        className="card-body "
        style={{ display: isActive ? "block" : "none" }}
      >
        <div className="d-flex justify-content-between">
         <h5 className="text-primary fw-semibold mb-0 mt-2">
                                      Daftar Kategori Program
                                    </h5>
        
        <Button
          iconName="add"
          classType="primary btn-sm mb-2 py-2 rounded-3"
          label="Tambah Kategori"
          onClick={() => onChangePage("addKategori", data)}
        />
        </div>
        {children}
      </div>
    </div>
  );
};

export default CardProgram;
