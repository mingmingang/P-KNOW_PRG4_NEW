import React, { useState ,useEffect} from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import CardProgram from "./CardProgram2";
import { colors } from "@mui/material";
import Alert from "./Alert";

const MAX_DESCRIPTION_LENGTH = 300;

const CardKK = ({ kk, onChangePage }) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [expandDeskripsi, setExpandDeskripsi] = useState({});
  const [cardHeight, setCardHeight] = useState("auto");
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleExpandDescription = (key) => {
    setExpandDeskripsi({ ...expandDeskripsi, [key]: !expandDeskripsi[key] });
  };
  useEffect(() => {
    const descriptionLength = kk.Deskripsi.length;
    if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
      setCardHeight("auto"); 
    }
  }, [kk.Deskripsi]);
  return (
    <div className="mb-3 mt-3" style={{margin:"100px"}}>
       <h5
            className="px-3 py-2"
            style={{
              color:"#0A5EA8",
              fontSize:"30px",
              fontWeight:"600",
            }}
            
          >{kk["Nama Kelompok Keahlian"]}</h5>
      <div className="card p-0 mb-3" style={{ borderRadius: "10px", height: cardHeight }}> {/* Set tinggi kartu */}
        <div className="card-body p-0">
          <div className="card-body px-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="card-programtitle mb-0">
                <Icon name="align-left" type="Bold" cssClass="btn px-2 py-0" style={{color:"#0A5EA8"}} title="Program" />
                <span>
                  <a href="#" className="text-decoration-none text-dark">{kk.ProgramCount} Program</a>
                </span>
                <Icon name="users" type="Bold" cssClass="btn px-2 py-0 ms-3" style={{color:"#0A5EA8"}} title="Anggota Kelompok Keahlian" />
                <span>
                  <a href="#" className="text-decoration-none text-dark">{kk.AnggotaCount} Anggota</a>
                </span>
              </h6>
              <div className="ps-3">
                <Button
                  iconName={isContentVisible ? "caret-up" : "caret-down"}
                  classType="btn-sm"
                  onClick={toggleContentVisibility}
                  title="Detail Kelompok Keahlian"
                  style={{background:"white", color:"#0A5EA8",  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", fontSize:"25px", padding:"5px 10px", borderRadius:"10px" }}
                />
              </div>
            </div>
            <p
              className=" mb-0"
              style={{
                width: "95%",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                fontSize: "15px",
                maxHeight: expandDeskripsi ? "none" : "75px",
                overflow: "hidden",
                textAlign:'justify',
                lineHeight:"25px"
              }}  
            >
              {kk.Deskripsi.length > MAX_DESCRIPTION_LENGTH && !expandDeskripsi[kk.Key] ? (
                <>
                  {kk.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH) + " ..."}
                  <a
                    className="btn btn-link text-decoration-none p-0"
                    onClick={() => handleExpandDescription(kk.Key)}
                    style={{ fontSize: "12px" }}
                  >
                    Baca Selengkapnya <Icon name={"caret-down"} />
                  </a>
                </>
              ) : (
                <>
                  {kk.Deskripsi}
                  {expandDeskripsi[kk.Key] && (
                    <a
                      className="btn btn-link text-decoration-none p-0"
                      onClick={() => handleExpandDescription(kk.Key)}
                      style={{ fontSize: "12px" }}
                    >
                      Tutup <Icon name={"caret-up"} />
                    </a>
                  )}
                </>
              )}
            </p>
            <p style={{color:"#0A5EA8", fontWeight:"600", margin:"10px 0px"}}>Daftar Program dalam Kelompok Keahlian {kk["Nama Kelompok Keahlian"]}</p>
            <hr style={{ opacity: "0.1" }} />
            {isContentVisible && (
              <>
                  {
                    kk.programs.length === 0 ? (
                      <div className="">
                       <Alert
                  type="warning mt-3"
                  message="Belum ada program!"
                />
                      </div>
                    ) : null
                  }
                {kk.programs.map((program) => (
                  <CardProgram key={program.Key} program={program} onChangePage={onChangePage} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardKK;
