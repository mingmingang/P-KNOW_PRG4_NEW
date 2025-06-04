import React, { useState, useEffect } from "react";
import Button from "../../../part/Button copy";
import Icon from "../../../part/Icon";
import { decode } from "html-entities";
import pknowMaskot from "../../../../assets/pknowmaskot.png";
import BackPage from "../../../../assets/backPage.png";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import UseFetch from "../../../util/UseFetch";
import { API_LINK, PAGE_SIZE, APPLICATION_ID } from "../../../util/Constants";

const inisialisasiData = [
  {
    ID: null,
    Nama: null,
    "Nomor Telepon": null,
    Username: null,
    "Tanggal Klaim": null,
    Count: 0,
  },
];


const ListPesertaProgram = ({ onChangePage, withID }) => {

  console.log("onchange", withID)
   let activeUser = "";
    const cookie = Cookies.get("activeUser");
    if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  

   const [currentData, setCurrentData] = useState(inisialisasiData);
   const [isError, setIsError] = useState({ error: false, message: "" });
     const [loadingStates, setLoadingStates] = useState({
    userData: true,
    programData: true,
    publikasiData: true,
    eksternalData: true,
    kategoriProgram: true,
  });

  // Static data for participants with additional fields
  const initialParticipants = [
    {
      id: 1,
      nama: "Kristina",
      email: "kristina@example.com",
      progres: "75%",
      skorQuiz: 85,
      sertifikatStatus: null, // null, 'approved', or 'rejected'
      sertifikatFile: null
    },
    {
      id: 2,
      nama: "Riesta Pinky",
      email: "riesta@example.com",
      progres: "90%",
      skorQuiz: 92,
      sertifikatStatus: null,
      sertifikatFile: null
    },
    {
      id: 3,
      nama: "Candra Bagus",
      email: "candra@example.com",
      progres: "60%",
      skorQuiz: 78,
      sertifikatStatus: null,
      sertifikatFile: null
    },
    {
      id: 4,
      nama: "Sisia Dika",
      email: "sisia@example.com",
      progres: "100%",
      skorQuiz: 65,
      sertifikatStatus: null,
      sertifikatFile: null
    },
    {
      id: 5,
      nama: "Michael Brown",
      email: "michael@example.com",
      progres: "100%",
      skorQuiz: 95,
      sertifikatStatus: null,
      sertifikatFile: null
    }
  ];

  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleGoBack = () => {
    onChangePage("kk", { Key: withID });
  };

  const handleCertificateAction = (id, action) => {
    setParticipants(prevParticipants =>
      prevParticipants.map(participant => {
        if (participant.id === id) {
          return {
            ...participant,
            sertifikatStatus: action,
            sertifikatFile: action === 'approved' ? null : participant.sertifikatFile
          };
        }
        return participant;
      })
    );
  };

  const handleFileChange = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      setParticipants(prevParticipants =>
        prevParticipants.map(participant => {
          if (participant.id === id) {
            return {
              ...participant,
              sertifikatFile: file.name
            };
          }
          return participant;
        })
      );
    }
  };

   const [currentFilterProgram, setCurrentFilterProgram] = useState({
    page: withID,
    query: "",
    sort: "[Waktu] desc",
    app: APPLICATION_ID,
    status: "Belum Dibaca",
  });

    const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
      const fetchEksternalData = async () => {
        setIsError(false);
        updateLoadingState('eksternalData', true);
        try {
          const data = await UseFetch(
            API_LINK + "Klaim/GetUserEksKlaimByProgram",
            currentFilterProgram
          );
          if (data === "ERROR") {
            setIsError(true);
          } else if (data.length === 0) {
            setCurrentData(inisialisasiData);
          } else {
            const formattedData = data.map((value) => ({
              // ...value,
              ID: value["ext_id"],
              Nama: value["ext_nama_lengkap"],
              "Nomor Telepon": value["ext_no_telp"],
              Username: value["ext_username"],
            }));
            setCurrentData(formattedData);
          }
        } catch {
          setIsError(true);
        } finally {
          updateLoadingState('eksternalData', false);
        }
      };
  
      fetchEksternalData();
    }, [currentFilterProgram]);

  return (
    <div className="container mb-4" style={{ marginTop: "100px" }}>
      <div className="" style={{ display: "flex" }}>
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
          Daftar Peserta Program
        </h4>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ color: "#0A5EA8" }}>No</th>
                  <th style={{ color: "#0A5EA8" }}>Nama Peserta</th>
                  <th style={{ color: "#0A5EA8" }}>Progres</th>
                  <th style={{ color: "#0A5EA8", textAlign:"center" }}>Skor Quiz</th>
                  <th style={{ color: "#0A5EA8" }}>Status Sertifikat</th>
                  <th style={{ color: "#0A5EA8" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={participant.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={pknowMaskot}
                          alt={participant.nama}
                          className="img-fluid rounded-circle me-3"
                          width="45"
                        />
                        <div>
                          <div>{participant.nama}</div>
                          <small className="text-muted">{participant.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="progress" style={{ height: "20px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: participant.progres }}
                          aria-valuenow={parseInt(participant.progres)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {participant.progres}
                        </div>
                      </div>
                    </td>
                    <td style={{textAlign:"center"}}>
                      <span className={`badge ${participant.skorQuiz >= 80 ? 'bg-success' : 'bg-warning'}`}>
                        {participant.skorQuiz}
                      </span>
                    </td>
                    <td>
                      {participant.sertifikatStatus === 'approved' ? (
                        <span className="badge bg-success">Disetujui</span>
                      ) : participant.sertifikatStatus === 'rejected' ? (
                        <span className="badge bg-danger">Ditolak</span>
                      ) : (
                        <span className="badge bg-secondary">Belum Diputuskan</span>
                      )}
                    </td>
                   <td>
  {parseInt(participant.progres) < 100 ? (
    <span className="text-muted">
      <i className="bi bi-info-circle me-1"></i>
      Pembelajaran belum diselesaikan.
    </span>
  ) : participant.sertifikatStatus === 'approved' ? (
    <div>
      {participant.sertifikatFile ? (
        <span className="text-success">
          <i className="bi bi-file-earmark-check me-1"></i>
          {participant.sertifikatFile}
        </span>
      ) : (
        <div className="input-group">
          <input
            type="file"
            id={`file-upload-${participant.id}`}
            className="form-control form-control-sm"
            onChange={(e) => handleFileChange(participant.id, e)}
            style={{ display: 'none' }}
          />
          <label
            htmlFor={`file-upload-${participant.id}`}
            className="btn btn-sm btn-outline-primary"
          >
            <i className="bi bi-upload me-1"></i> Pilih File
          </label>
        </div>
      )}
    </div>
  ) : participant.sertifikatStatus === 'rejected' ? (
    <span className="text-danger">
      <i className="bi bi-x-circle me-1"></i>
      Tidak dapat sertifikat
    </span>
  ) : (
    <div className="btn-group btn-group-sm">
  <button
    className="btn"
    style={{
      background: 'linear-gradient(45deg, #1e90ff, #007bff)',
      color: 'white',
      border: 'none'
    }}
    onClick={() => handleCertificateAction(participant.id, 'approved')}
  >
    <i className="bi bi-check-circle me-1"></i> Acc
  </button>
  <button
    className="btn"
    style={{
      background: 'linear-gradient(45deg, #ff4d4d, #dc3545)',
      color: 'white',
      border: 'none'
    }}
    onClick={() => handleCertificateAction(participant.id, 'rejected')}
  >
    <i className="bi bi-x-circle me-1"></i> Tolak
  </button>
</div>

  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPesertaProgram;