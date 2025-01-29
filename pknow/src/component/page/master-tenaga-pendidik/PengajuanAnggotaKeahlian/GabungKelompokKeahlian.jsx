import React, { useEffect, useRef, useState } from "react";
import Button from "../../../part/Button copy";
import FileUpload from "../../../part/FileUpload";
import Label from "../../../part/Label";
import Loading from "../../../part/Loading";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { array, object, string } from "yup";
import UseFetch from "../../../util/UseFetch";
import uploadFile from "../../../util/UploadFile";
import SweetAlert from "../../../util/SweetAlert";
import Alert from "../../../part/Alert";
import Alert2 from "../../../part/AlertLogin";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";

export default function PengajuanAdd({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [lampiranCount, setLampiranCount] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);  
  const lampiranRefs = useRef([]);
  const [fileInfos, setFileInfos] = useState([]);


  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  // const handleHapusLampiran = (index) => {
  //   // Hapus file dari fileInfos
  //   setFileInfos((prevInfos) => prevInfos.filter((_, i) => i !== index));
  
  //   // Hapus referensi file
  //   lampiranRefs.current = lampiranRefs.current.filter((_, i) => i !== index);
  
  //   // Kurangi jumlah lampiran
  //   setLampiranCount((prevCount) => prevCount - 1);
  // };
  

  const handleHapusLampiran = (index) => {
    setFileInfos((prevInfos) => prevInfos.filter((_, i) => i !== index));
    lampiranRefs.current = lampiranRefs.current.filter((_, i) => i !== index);
    setLampiranCount((prevCount) => prevCount - 1);
  };
  

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


  const formDataRef = useRef({
    kke_id: withID["ID KK"],
    kry_id: userData.kry_id,
    status: "Menunggu Acc",
    creaby: activeUser,
    lampirans: [],
  });

  const userSchema = object({
    kke_id: string(),
    kry_id: string(),
    status: string(),
    creaby: string(),
    lampirans: array().of(string()).required("harus diisi"),
  });

  const resetForm = () => {
    formDataRef.current = {
      kke_id: withID["ID KK"],
      kry_id: userData.kry_id,
      status: "Menunggu Acc",
      creaby: activeUser,
      lampirans: [],
    };

    lampiranRefs.current.forEach((ref) => {
      if (ref && ref.current) {
        ref.current.value = "";
      }
    });

    setLampiranCount(1);
    setFileInfos([]);
    setErrors({});
  };

  const handleTambahLampiran = () => {
    setLampiranCount((prevCount) => {
      lampiranRefs.current[prevCount] = React.createRef();
      return prevCount + 1;
    });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          formDataRef.current.kry_id = data[0].kry_id;
          break;
        }
      }
    } catch (error) {
      setUserData(null);
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

  const handleFileChange = async (ref, extAllowed, index) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));

    if (!error) {
      setFileInfos((prevInfos) => {
        const newInfos = [...prevInfos];
        newInfos[index] = {
          fileName,
          fileSize: (fileSize / 1024 / 1024).toFixed(2) + " MB",
          fileExt,
        };
        return newInfos;
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (fileInfos.length === 0) {
      SweetAlert(
        "Gagal",
        "Pengajuan gagal. Tolong lampirkan minimal 1 file",
        "warning"
      );
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    lampiranRefs.current.forEach((ref, index) => {
        if (ref && ref.current) {
          console.log(`Referensi ke-${index}:`, ref.current.files);
          if (ref.current.files.length > 0) {
            console.log(`File di referensi ke-${index}:`, ref.current.files[0]);
          } else {
            console.log(`Referensi ke-${index} tidak memiliki file.`);
          }
        } else {
          console.log(`Referensi ke-${index} tidak valid.`);
        }
      });

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin mengirim pengajuan ini?",
        "info",
        "Ya"
      ).then(async (confirm) => {
        if (confirm) {
          setIsLoading(true);

        //   const uploadPromises = [];
        //   formDataRef.current.lampirans = [];
        //   console.log(formDataRef.current);

        //     lampiranRefs.current.forEach((ref, index) => {
        //         if (ref && ref.current && ref.current.files.length > 0) {
        //           const file = ref.current.files[0];
        //           console.log(`Memulai upload file ${index + 1}:`, file.name);
              
        //           uploadPromises.push(
        //             uploadFile(ref.current)
        //               .then((data) => {
        //                 // Cek apakah respons memiliki properti "Hasil"
        //                 if (data && data.Hasil) {
        //                   formDataRef.current.lampirans.push({
        //                     pus_file: data.Hasil, // Gunakan properti "Hasil"
        //                   });

        //                   console.log(`File ${index + 1} berhasil diupload:`, data.Hasil);
        //                 }else {
        //                     console.error(`Upload file ${index + 1} gagal:`, data);
        //                     throw new Error("File upload failed");
        //                 }
        //               })
        //               .catch((error) => {
        //                 console.error(`Error saat mengupload file ${index + 1}:`, error);
        //                 throw error;
        //               })
        //           );
        //         } else {
        //           console.warn(`Lampiran ${index + 1} tidak ditemukan atau kosong.`);
        //         }
        //       });

        const uploadPromises = [];
        formDataRef.current.lampirans = [];

        // lampiranRefs.current.forEach((ref) => {
        //   if (ref && ref.current && ref.current.files.length > 0) {
        //     uploadPromises.push(
        //       uploadFile(ref.current).then((data) => {
        //         if (data !== "ERROR" && data.Hasil) {
        //           console.log("hasil", data.Hasil)
        //           formDataRef.current.lampirans.push({
        //             pus_file: data.Hasil,
        //           });
        //         } else {
        //           throw new Error("File upload failed");
        //         }
        //       })
        //     );
        //   }
        // });

        lampiranRefs.current.forEach((ref, index) => {
          if (ref && ref.current && ref.current.files.length > 0) {
            console.log(`Memproses lampiran ke-${index}:`, ref.current.files[0].name);
            uploadPromises.push(
              uploadFile(ref.current).then((data) => {
                if (data !== "ERROR" && data.Hasil) {
                  console.log(`File ${index + 1} berhasil diunggah:`, data.Hasil); // Debugging
                  formDataRef.current.lampirans.push({ pus_file: data.Hasil });
                } else {
                  console.error(`File ${index + 1} gagal diunggah.`);
                }
              })
            );
          } else {
            console.warn(`Lampiran ke-${index} tidak memiliki file.`);
          }
        });

        // lampiranRefs.current.forEach((ref) => {
        //     if (ref && ref.current && ref.current.files.length > 0) {
        //       uploadPromises.push(
        //         uploadFile(ref.current).then((data) => {
        //           if (data !== "ERROR" && data.Hasil) {
        //             // Assuming 'data.Hasil' is the filename of the uploaded file
        //             const fileName = data.Hasil;
          
        //             // If you want to store only the filename and not the entire object:
        //             formDataRef.current.lampirans.push(fileName); // Push only the filename
        //           } else {
        //             throw new Error("File upload failed");
        //           }
        //         })
        //       );
        //     }
        //   });
          
          try {
            await Promise.all(uploadPromises);

            console.log("Data lampiran:", JSON.stringify(formDataRef.current.lampirans, null, 2));
            const response = await UseFetch(
              API_LINK + "PengajuanKK/SaveAnggotaKK",
              {
              kke_id: withID["ID KK"],
              kry_id: userData.kry_id,
              status: "Menunggu Acc",
              creaby: activeUser,
              lampirans: JSON.stringify(formDataRef.current.lampirans, null, 2),
              }
            );
            console.log("response", {
              kke_id: withID["ID KK"],
              kry_id: userData.kry_id,
              status: "Menunggu Acc",
              creaby: activeUser,
              lampirans: JSON.stringify(formDataRef.current.lampirans, null, 2),
              })

              console.log("responn", response)
            if (response === "ERROR") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menyimpan data Pengajuan KK.",
              });
            } else {
              SweetAlert(
                "Sukses",
                "Data Pengajuan berhasil disimpan",
                "success"
              );
              UseFetch(API_LINK + "Utilities/createNotifikasi", {
                p1: "SENTTOPRODI", // Penanda aksi
                p2: "ID123458", // ID pengajuan
                p3: "APP59", // Aplikasi
                p4: "TENAGA PENDIDIK", // Pengirim
                p5: formDataRef.current.creaby, // CC (not_cc)
                p6: "Terdapat Pengajuan Anggota Kelompok Keahlian", // Pesan
                p7: "Persetujuan Anggota KK", // Subjek
                p8: "Tenaga Pendidik Menunggu Persetujuan Anggota Kelompok Keahlian", // Body Message
                p9: "Dari Tenaga Pendidik", // Footer Pesan
                p10: "0", // Tipe Notifikasi
                p11: "Jenis Lain", // ID Pengajuan
                p12: formDataRef.current.creaby, // Pembuat notifikasi
                p13: 'ROL02', // User pembuat notifikasi
                p14: withID["Kode Prodi"],
              })
                .then((data) => {
                  if (data === "ERROR" || data.length === 0) {
                    setIsError(true);
                    SweetAlert(
                      "Error",
                      "Gagal mengirimkan notifikasi.",
                      "error"
                    );
                  } else {
                    SweetAlert(
                      "Berhasil",
                      "Notifikasi telah dikirimkan ke PRODI. Tunggu konfirmasi dari PRODI.",
                      "success"
                    );
                  }
                })

              window.location.reload();
            }
          } catch (error) {
            setIsError({
              error: true,
              message:
                "Terjadi kesalahan: Gagal mengupload file atau menyimpan data.",
            });
          } finally {
            setIsLoading(false);
          }
        }
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isError.error && (
            <div className="flex-fill">
              <Alert2 type="danger" message={isError.message} />
            </div>
          )}
            <div className="" style={{display:"flex", justifyContent:"space-between", marginTop:"100px", marginLeft:"70px", marginRight:"70px"}}>
            <div className="back-and-title" style={{display:"flex"}}>
              <button style={{backgroundColor:"transparent", border:"none"}} onClick={handleGoBack}><img src={BackPage} alt="" /></button>
                <h4 style={{ color:"#0A5EA8", fontWeight:"bold", fontSize:"30px", marginTop:"10px", marginLeft:"20px"}}>Pengajuan Kelompok Keahlian</h4>
              </div>
                <div className="ket-draft">
                <span className="badge text-bg-dark " style={{fontSize:"16px"}}>Draft</span>
                </div>
              </div>
              <div className="" style={{ margin: "30px 70px" }}>
          <form onSubmit={handleAdd}>
            <div className="card">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-6">
                    <Label title="Nama" data={userData.Nama} />
                  </div>
                  <div className="col-lg-6">
                    <Label
                      title="Kelompok Keahlian"
                      data={withID["Nama Kelompok Keahlian"]}
                    />
                  </div>
                  <div className="col-lg-12 mt-3">
                  <div className="fw-bold mb-3" >
                        Lampiran Pendukung
                      </div>
                    <div className="card">
                      <div className="card-body p-4">
                        <Alert
                          type="info fw-bold"
                          message="Notes: Lampiran dapat berupa Sertifikat Keahlian, Surat Tugas, atau
                          Berkas Lainnya yang berkaitan"
                        />
                        <div className="d-flex" style={{justifyContent:"space-between"}}>
                            <div className="">
                        <p className="mb-0">
                          Format Penamaan:
                          namafile_namakelompokkeahlian_namakaryawan (Opsional)
                        </p>
                        <p className="">
                          Contoh: SertifikasiMicrosoft_DataScience_CandraBagus
                        </p>
                        </div>
                        <div className="">
                        <Button
                          iconName="add"
                          classType="primary btn-sm mb-3 rounded-4 py-2"
                          label="Tambah Lampiran"
                          onClick={handleTambahLampiran}
                        />
                        </div>
                        </div>
                        {[...Array(lampiranCount)].map((_, index) => (
                          <>
                          <div className="d-flex">
                          <div key={index} style={{width:"130%"}}>
                            <FileUpload
                              isRequired="true"
                              forInput={`lampiran_${index}`}
                              label={`Lampiran ${index + 1}`}
                              onChange={() =>
                                handleFileChange(
                                  lampiranRefs.current[index],
                                  "pdf",
                                  index
                                )
                              }
                              formatFile=".pdf"
                              ref={
                                lampiranRefs.current[index] ||
                                (lampiranRefs.current[index] =
                                  React.createRef())
                              }
                              style={{width:"185%"}}
                            />
                            {fileInfos[index] && (
                              <div className="mt-2">
                                <strong>File Info:</strong>
                                <ul>
                                  <li>Nama: {fileInfos[index].fileName}</li>
                                  <li>Ukuran: {fileInfos[index].fileSize}</li>
                                  <li>Ekstensi: {fileInfos[index].fileExt}</li>
                                </ul>
                              </div>
                            )}
                             
                          </div>
                          <div style={{marginTop:"60px"}}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm ms-3"
                            onClick={() => handleHapusLampiran(index)}
                          >
                            Hapus
                          </button>
                          </div>
                          </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="d-flex justify-content-end"
                style={{
                  marginRight: "20px",
                  marginTop: "-10px",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={resetForm}
                  style={{
                    marginRight: "10px",
                    padding: "5px 15px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Batalkan
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  type="submit"
                  style={{
                    marginRight: "10px",
                    padding: "5px 20px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </form>
          {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : "Anda yakin ingin simpan data?"}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
        )}
          </div>
        </>
      )}
    </>
  );
}
