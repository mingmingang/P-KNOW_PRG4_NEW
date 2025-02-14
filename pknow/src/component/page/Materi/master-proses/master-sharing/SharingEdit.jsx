import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import UseFetch from "../../../../util/UseFetch";
import UploadFile from "../../../../util/UploadFile";
import Button from "../../../../part/Button copy";
import DropDown from "../../../../part/Dropdown";
import Input from "../../../../part/Input";
import Loading from "../../../../part/Loading";
import Alert from "../../../../part/Alert";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import FileUpload from "../../../../part/FileUpload";
import uploadFile from "../../../../util/UploadFile";
import { Stepper, Step, StepLabel, Box  } from '@mui/material'; 
import Konfirmasi from "../../../../part/Konfirmasi";
import BackPage from "../../../../../assets/backPage.png";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import axios from "axios";

const steps = ["Pengenalan", "Materi", "Forum", "Sharing Expert", "Pre Test", "Post Test"];

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return 'pengenalanEdit';
    case 1:
      return 'materiEdit';
    case 2:
      return 'forumEdit';
      case 3:
      return 'sharingEdit';
    case 4:
      return 'pretestEdit';
      case 5:
      return 'posttestEdit';
    default:
      return 'Unknown stepIndex';
  }
}

function CustomStepper({ activeStep, steps, onChangePage, getStepContent }) {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step
            key={label}
            onClick={() => onChangePage(getStepContent(index))} 
            sx={{
              cursor: "pointer",
              "& .MuiStepIcon-root": {
                fontSize: "1.5rem",
                color: index <= activeStep ? "primary.main" : "grey.300",
                "&.Mui-active": {
                  color: "primary.main",
                },
                "& .MuiStepIcon-text": {
                  fill: "#fff",
                  fontSize: "1rem",
                },
              },
            }}
          >
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  typography: "body1",
                  color: index <= activeStep ? "primary.main" : "grey.500",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default function MasterSharingEdit({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false); 

  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);

  const Materi = AppContext_test.DetailMateriEdit;

  async function fetchSectionData() {
    AppContext_test.sharingExpertPDF = AppContext_test.DetailMateriEdit.Sharing_pdf;
    try {
      const response = await axios.post(API_LINK + 'Section/GetDataSectionByMateri', {
        p1 : Materi.Key,
        p2 : 'Sharing Expert',
        p3 : 'Aktif'
      });

      // Handle the response
      if (response.status === 200) {
        const data = response.data;
        const secId = data[0].SectionId;
        const materialId = Materi.Key;
        formDataRef.current.sec_id = secId;
        formDataRef.current.mat_id = materialId;
        AppContext_test.sharingExpertPDF = data[0].ExpertFile;
        AppContext_test.sharingExpertVideo = data[0].ExpertVideo;
        return { secId, materialId};
      } else {
        console.error('Failed to fetch data, status:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  const matIdFromContext = AppContext_master.MateriForm;

  const previewFile = async (namaFile) => {
    try {
      namaFile = namaFile.trim();
      const response = await axios.get(
        `${API_LINK}Upload/GetFile/${namaFile}`,
        {
          responseType: "arraybuffer",
        }
      );
  
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
  
      // Cek tipe file
      if (response.headers["content-type"] === "application/pdf") {
        window.open(url, "_blank"); // Pratinjau PDF
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = namaFile;
        link.click();
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      alert("Tidak dapat menampilkan pratinjau. Silakan unduh file.");
    }
  };



  fetchSectionData(matIdFromContext).then((data) => {
    if (data) {
      console.log('Data fetched successfully:', data);
    } else {
      console.log('Failed to fetch data.');
    }
  });



  const handleGoBack = () => {
    setIsBackAction(true);  
    setShowConfirmation(true);  
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false); 
    window.location.reload();
  };


  const handleConfirmNo = () => {
    setShowConfirmation(false);  
  };

  const formDataRef = useRef({
    sec_id: "",
    mat_id: "",
    mat_sharing_expert_pdf: "",
    mat_sharing_expert_video: "",
  });


  const userSchema = object({
    sec_id: string(),
    mat_id: string().required("ID Materi tidak boleh kosong"),
    mat_sharing_expert_pdf: string(),
    mat_sharing_expert_video: string(),

  });

  const handlePdfChange = () => handleFileChange(fileInputRef, "pdf,docx,xlsx,pptx", 10);
  const handleVideoChange = () => handleFileChange(vidioInputRef, "mp4,mov", 250);
  const handleFileChange = async (ref, extAllowed, maxFileSize) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > maxFileSize) {
      error = `Berkas terlalu besar, maksimal ${maxFileSize}MB`;
      SweetAlert("Error", error, "error");
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "Format berkas tidak valid";
      SweetAlert("Error", error, "error");
    }
    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    const isPdfEmpty = !fileInputRef.current.files.length;
    const isVideoEmpty = !vidioInputRef.current.files.length;

    if (isPdfEmpty && isVideoEmpty) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        mat_sharing_expert_pdf: "Pilih salah satu antara PDF atau Video",
        mat_sharing_expert_video: "Pilih salah satu antara PDF atau Video",
      }));
      return;
    }
    
    if (
      Object.values(validationErrors).every((error) => !error) &&
      (!isPdfEmpty || !isVideoEmpty)
    ) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const uploadPromises = [];

      // Upload file PDF jika ada
      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current.mat_sharing_expert_pdf = data.Hasil;
            AppContext_test.sharingExpertPDF = data.Hasil;
          })
        );
      }
      // Upload file video jika ada
      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current.mat_sharing_expert_video = data.Hasil;
            AppContext_test.sharingExpertVideo = data.Hasil;
          })
        );
      }
      try {
        await Promise.all(uploadPromises);

        // Kirim data ke API
        const response = await axios.post(API_LINK + "SharingExpert/UpdateDataSharing", {
          p1: formDataRef.current.sec_id, 
          p2: formDataRef.current.mat_sharing_expert_pdf || "", 
          p3: formDataRef.current.mat_sharing_expert_video || "", 
          p4: activeUser, 
        });

        if (response.status === 200) {
          SweetAlert("Berhasil", "Data Sharing Expert berhasil diubah!", "success");
        } else {
          throw new Error("Gagal untuk menyimpan data Sharing Expert");
        }
      } catch (error) {
        console.error("Error editing Sharing Expert data:", error);
        setIsError({
          error: true,
          message: "Terjadi kesalahan: " + error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };


  if (isLoading) return <Loading />;

  const hasPDF = Materi.Sharing_pdf !== null && Materi.Sharing_pdf !== "";
  const hasVideo = Materi.Sharing_video !== null && Materi.Sharing_video !== "";

  const handlePageChange = (content) => {
    onChangePage(content);
  };


  return (
    <>
     <div className="" style={{display:"flex", justifyContent:"space-between", marginTop:"100px", marginLeft:"70px", marginRight:"70px"}}>
            <div className="back-and-title" style={{display:"flex"}}>
              <button style={{backgroundColor:"transparent", border:"none"}} onClick={handleGoBack}><img src={BackPage} alt="" /></button>
                <h4 style={{ color:"#0A5EA8", fontWeight:"bold", fontSize:"30px", marginTop:"10px", marginLeft:"20px"}}>Edit Sharing Expert</h4>
              </div>
              </div>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      
      <form onSubmit={handleAdd} style={{marginBottom:"20px"}}>
      <div className="mb-4">
            <CustomStepper
          activeStep={3}
          steps={steps}
          onChangePage={handlePageChange}
          getStepContent={getStepContent}
        />
        </div>
        <div className="card" style={{margin:"0px 80px"}}>
          <div className="card-body p-4">
            {hasPDF || hasVideo ? (
              <div className="row">
                <div className="col-lg-6">
                  <FileUpload
                    ref={fileInputRef}
                    forInput="mat_sharing_expert_pdf"
                    label="File Sharing Expert (.pdf, .docx, .xlsx, .pptx)"
                    formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                    onChange={() => handlePdfChange(fileInputRef, "pdf,docx,xlsx,pptx")}
                    errorMessage={errors.mat_sharing_expert_pdf}
                  />
                  {AppContext_test.sharingExpertPDF && (
                    <a style={{textDecoration:"none"}}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault(); 
                        previewFile(AppContext_test.sharingExpertPDF); 
                      }}
                    >
                      Lihat berkas yang telah diunggah
                    </a>
                  )}
                </div>
                <div className="col-lg-6">
                  <FileUpload
                    ref={vidioInputRef}
                    forInput="mat_sharing_expert_video"
                    label="Video Sharing Expert (.mp4, .mov)"
                    formatFile=".mp4,.mov"
                    maxFileSize={250}
                    onChange={() => handleVideoChange(vidioInputRef, "mp4,mov")}
                    errorMessage={errors.mat_sharing_expert_video}
                  />
                  {AppContext_test.sharingExpertVideo && (
                    <a style={{textDecoration:"none"}}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault(); 
                        previewFile(AppContext_test.sharingExpertVideo); 
                      }}
                    >
                      Lihat berkas yang telah diunggah
                    </a>
                  )}
                </div>

                <div className="float my-4 mx-1 d-flex " style={{justifyContent:"space-between"}}>
                  <div className="">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Sebelumnya"
            onClick={() => onChangePage("forumEdit", AppContext_test.ForumForm, AppContext_test.MateriForm , AppContext_master.count += 1)}
          />
          </div>
          <div className="d-flex">
          {hasPDF || hasVideo ? (
            <div className="mr-2">
              <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label="Edit"
              />
              </div>
          ) : (
            null  
          )}
           <Button
            classType="primary ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestEdit", AppContext_master.MateriForm, AppContext_master.count += 1)}
          />
          </div>
        </div>
              </div>
            ) : (
              <>
              <div className="" style={{marginLeft:"20px", marginRight:"20px"}}>
              <Alert type="warning" message={(
                <span>
                  Data Sharing Expert belum ditambahkan. <a onClick={() => onChangePage("sharingEditNot", AppContext_master.MateriForm)} className="text-primary">Tambah Data</a>
                </span>
              )} />
              </div>
                <div className="d-flex justify-content-between ">
            <div className="ml-4">
            <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Sebelumnya"
            onClick={() => onChangePage("forumEdit", AppContext_test.ForumForm, AppContext_test.MateriForm , AppContext_master.count += 1)}
          />
          </div>
          <div className="d-flex mr-4" >
          <Button
            classType="primary ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestEdit", AppContext_master.MateriForm, AppContext_master.count += 1, AppContext_test.ForumForm)}
          />
          </div>
        </div>
            </>
              
            )}
          </div>
        </div>
        {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : "Anda yakin ingin simpan data?"}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
        )}
      </form>
    </>
  );
}
