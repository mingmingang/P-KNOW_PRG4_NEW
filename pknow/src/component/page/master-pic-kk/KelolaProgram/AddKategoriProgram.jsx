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
import Label from "../../../part/Label";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";

export default function KategoriProgramAdd({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
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


  const formDataRef = useRef({
    idProgram: "",
    nama: "",
    deskripsi: "",
  });

  const resetForm = () => {
    formDataRef.current = {
      idProgram: withID.Key,
      nama: "",
      deskripsi: "",
    };
  };

  const userSchema = object({
    idProgram: string(),
    nama: string().max(100, "maksimum 100 karakter").required("harus diisi"),
    deskripsi: string().required("harus dipilih"),
  });

  useEffect(() => {
    formDataRef.current = {
      idProgram: withID.Key,
      nama: "",
      deskripsi: "",
    };
  }, []);

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

      setErrors({});

      UseFetch(
        API_LINK + "KategoriProgram/CreateKategoriProgram",
        formDataRef.current
      )
        .then((data) => {
          if (data === "ERROR") {
            setIsError((prevError) => {
              return {
                ...prevError,
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menyimpan data kategori program.",
              };
            });
          } else {
            SweetAlert(
              "Sukses",
              "Data Kategori berhasil disimpan",
              "success"
            );
            onChangePage("index");
          }
        })
        .then(() => setIsLoading(false));
    }
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
        <div className="" style={{display:"flex", justifyContent:"space-between", marginTop:"100px", marginLeft:"70px", marginRight:"70px"}}>
          <div className="back-and-title" style={{display:"flex"}}>
            <button style={{backgroundColor:"transparent", border:"none"}} onClick={handleGoBack}><img src={BackPage} alt="" /></button>
              <h4 style={{ color:"#0A5EA8", fontWeight:"bold", fontSize:"30px", marginTop:"10px", marginLeft:"20px"}}>Tambah Kategori</h4>
            </div>
              <div className="ket-draft">
              <span className="badge text-bg-dark " style={{fontSize:"16px", marginTop:"20px"}}>Draft</span>
              </div>
            </div>
        <div className="" style={{ margin: "30px 70px" }}>
        <form onSubmit={handleAdd}>
          <div className="card">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-12">
                  <Label title="Nama Program" data={withID["Nama Program"]} />
                </div>
                <div className="col-lg-12">
                  <Input
                    type="text"
                    forInput="nama"
                    label="Nama Kategori"
                    isRequired
                    placeholder="Nama Kategori"
                    value={formDataRef.current.nama}
                    onChange={handleInputChange}
                    errorMessage={errors.nama}
                  />
                </div>
                <div className="col-lg-12">
                  <label style={{ paddingBottom: "5px", fontWeight: "bold" }}>
                    Deskripsi/Penjelasan Singkat Kategori{" "}
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <textarea
                    className="form-control mb-3"
                    style={{
                      height: "200px",
                    }}
                    id="deskripsi"
                    name="deskripsi"
                    forInput="deskripsi"
                    value={formDataRef.current.deskripsi}
                    onChange={handleInputChange}
                    placeholder="Deskripsi/Penjelasan Program"
                    required
                  />
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
        </>
      )}
    </>
  );
}
