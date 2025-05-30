import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import NoImage from "../../../../assets/NoImage.png";
import FileUpload from "../../../part/FileUpload";
import UploadFile from "../../../util/UploadFile";
import "../../../../style/Program.css";


export default function ProgramAdd({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);  
  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);

  const formDataRef = useRef({
    idKK: "",
    idKry: "",
    nama: "",
    deskripsi: "",
    pro_gambar: "",
  });
  
  console.log("id", withID)

  const userSchema = object({
    idKK: string(),
    idKry: string(),
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi").min(25, "minimum 25 karakter"),
    deskripsi: string().required("harus dipilih").min(200, "minimum 200 karakter").max(300, "maksimum 300 karakter"),
    pro_gambar: string(),
  });

  useEffect(() => {
    formDataRef.current = {
      idKK: withID.Key,
      idKry: withID["Kode Karyawan"],
      nama: "",
      deskripsi: "",
      pro_gambar: "",
    };
  }, [withID]); 

  const resetForm = () => {
    formDataRef.current = {
      idKK: withID.Key,
      idKry: withID["Kode Karyawan"],
      nama: "",
      deskripsi: "",
      pro_gambar: "",
    };
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    try {
      await userSchema.validateAt(name, { [name]: value });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
    }

    formDataRef.current[name] = value;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
  
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
  
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
  
      const uploadPromises = [];
      setErrors({});
  
      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["pro_gambar"] = data.Hasil)
          )
        );
      }
  
      try {
        // Tunggu semua promise selesai
        await Promise.all(uploadPromises);

        console.log("ide", formDataRef.current);
  
        // Lakukan permintaan ke API setelah semua upload selesai
        const data = await UseFetch(
          API_LINK + "Program/CreateProgram",
          formDataRef.current
        );

        console.log("data yang dikirim", data)
  
        if (data === "ERROR") {
          setIsError((prevError) => {
            return {
              ...prevError,
              error: true,
              message: "Terjadi kesalahan: Gagal menyimpan data program.",
            };
          });
        } else {
          SweetAlert("Sukses", "Data Program berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        // Tangani error saat upload atau permintaan API gagal
        console.error("Error:", error);
        setIsError((prevError) => {
          return {
            ...prevError,
            error: true,
            message: "Terjadi kesalahan saat memproses permintaan.",
          };
        });
      } finally {
        // Pastikan state loading di-reset
        setIsLoading(false);
      }
    }
  };
  

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file ? file.name : "";
    const fileSize = file ? file.size : 0;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";
    else {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result); // Set the preview
        };
        reader.readAsDataURL(file);
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
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

  if (isLoading) return <Loading />;


  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="program-add-container">
            <div className="header-section add-pro">
              <div className="back-and-title add-pro">
              <button className="back-button" onClick={handleGoBack}><img src={BackPage} alt="" /></button>
                <h4 className="page-title">Tambah Program</h4>
              </div>
                <div className="ket-draft">
                <span className="draft-badge badge text-bg-dark ">Draft</span>
                </div>
              </div>
          <div className="form-container">
          <form onSubmit={handleAdd}>
            <div className="card tambah-program">
              <div className="card-body p-4">
              <div className="row">
              <div className="col-lg-4 file-preview-section">
                <div className="file-preview">
                  <div className="preview-img">
                    {filePreview ? (
                      <div
                        style={{
                          marginTop: "10px",
                          marginRight: "30px",
                          marginBottom: "20px",
                        }}
                      >
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="preview-image"
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: "10px",
                          marginRight: "30px",
                          marginBottom: "20px",
                        }}
                      >
                        <img
                          src={NoImage} // Use fallback image if no preview available
                          alt="No Preview Available"
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="fileupload">
                  <FileUpload
                    forInput="gambarInputref"
                    label="Gambar Program (.png)"
                    formatFile=".png"
                    ref={fileGambarRef}
                    onChange={() => handleFileChange(fileGambarRef, "png")}
                    errorMessage={errors.pro_gambar}
                    isRequired={true}
                  />
                </div>
              </div>
            </div>
                <div className="row">
                  <div className="col-lg-12">
                    <Input
                      type="text"
                      forInput="nama"
                      label="Nama Program"
                      isRequired
                      placeholder="Nama Program"
                      value={formDataRef.current.nama}
                      onChange={handleInputChange}
                      errorMessage={errors.nama}
                    />
                  </div>

                  <div className="col-lg-12">
                    {/* <label
                      style={{ paddingBottom: "5px", fontWeight: "bold" }}
                    >
                      Deskripsi/Penjelasan Program{" "}
                      <span style={{ color: "red" }}> *</span>
                    </label> */}
               

<Input
                  type="textarea"
                   placeholder="Deskripsi/Penjelasan Program"
                  forInput="deskripsi"
                  label="Deskripsi/Penjelasan Program"
                  isRequired
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                />
                  </div>
                </div>
              </div>
              <div
                className="action-buttons-tambahpro"
              >
              <button
                  className="cancel-button-tambahpro btn-secondary btn-sm"
                  type="button"
                  onClick={resetForm}
                >
                  Batalkan
                </button>
                <button
                  className="save-button-tambahpro btn-primary btn-sm"
                  type="submit"
                >
                  Simpan
                </button>
            </div>
            </div>
           
          </form>
          </div>
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
