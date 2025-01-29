import React, { useRef, useState, useEffect } from "react";
import Button from "../../../../part/Button copy";
import { object, string } from "yup";
import Input from "../../../../part/Input";
import Loading from "../../../../part/Loading";
import * as XLSX from "xlsx";
import axios from "axios";
import {
    validateAllInputs,
    validateInput,
} from "../../../../util/ValidateForm";
import { API_LINK } from "../../../../util/Constants";
import FileUpload from "../../../../part/FileUpload";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import AppContext_master from "../../master-test/TestContext";
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";
import NoImage from "../../../../../assets/NoImage.png";
import UploadFile from "../../../../util/UploadFile";

const steps = [
  "Pengenalan",
  "Materi",
  "Forum",
  "Sharing Expert",
  "Pre Test",
  "Post Test",
];

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



export default function MasterPreTestEditNot({ onChangePage, withID }) {
  const [formContent, setFormContent] = useState([]);
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [resetStepper, setResetStepper] = useState(0);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const Materi = AppContext_master.MateriForm;

  console.log("data materi", AppContext_master.MateriForm)
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

  const [formData, setFormData] = useState({
    materiId: AppContext_master.dataIDMateri,
    sec_id: AppContext_master.dataIdSection,
    quizDeskripsi: "",
    quizTipe: "Pretest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    createdby: activeUser,
    type: "Pre-Test",
  });

  const handlePointChange = (e, index) => {
    const { value } = e.target;

    // Update point pada formContent
    const updatedFormContent = [...formContent];
    updatedFormContent[index].point = value;
    setFormContent(updatedFormContent);

    // Update nilaiChoice pada formChoice
    setFormChoice((prevFormChoice) => ({
      ...prevFormChoice,
      nilaiChoice: value,
    }));
  };

  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      jenis: "Tunggal",
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "",
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };


  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: null,
    // questionDeskripsi: '',
    status: "Aktif",
    quecreatedby: activeUser,
  });

  formData.timer = timer;

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quecreatedby: activeUser,
  });

  const userSchema = object({
    materiId: string(),
    sec_id: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string(),
    tanggalAkhir: string(),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    createdby: string(),
    type: string(),
  });

  const initialFormQuestion = {
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: null,
    questionDeskripsi: "",
    status: "Aktif",
    quecreatedby: activeUser,
  };

  const handleQuestionTypeChange = (e, index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = e.target.value;
    setFormContent(updatedFormContent);
  };

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].jenis = value;

      // Tambahkan nilai cho_tipe berdasarkan jenis pilihan
      updatedFormContent[questionIndex].cho_tipe = value; // Tunggal atau Jamak

      // Reset opsi jika tipe berubah
      updatedFormContent[questionIndex].options = [];

      setSelectedOptions((prevSelected) => {
        const updatedSelected = [...prevSelected];
        updatedSelected[questionIndex] = value === "Tunggal" ? "" : [];
        return updatedSelected;
      });

      return updatedFormContent;
    });
  };


  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    if (updatedFormContent[index].type === "Pilgan") {
      updatedFormContent[index].options.push({ label: "", value: "", point: 0 });
      setFormContent(updatedFormContent);
    }
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const optionValue = formContent[questionIndex].options[optionIndex].value;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].options.splice(optionIndex, 1);
      return updatedFormContent;
    });

    setSelectedOptions((prevSelected) => {
      const updatedSelected = [...prevSelected];

      if (formContent[questionIndex].jenis === "Tunggal") {
        if (updatedSelected[questionIndex] === optionValue) {
          updatedSelected[questionIndex] = "";
        }
      } else if (formContent[questionIndex].jenis === "Jamak") {
        updatedSelected[questionIndex] = updatedSelected[questionIndex].filter(
          (v) => v !== optionValue
        );
      }

      return updatedSelected;
    });
  };

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fileGambarRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_LINK}Upload/UploadFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data) {
        console.log("Response data:", response.data); // Debugging log
        return response.data; // Pastikan ini berisi newFileName
      } else {
        throw new Error("Upload file gagal.");
      }
    } catch (error) {
      console.error("Error in uploadFile function:", error);
      throw error;
    }
  };


  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const maxSizeInMB = 10; 

    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Hanya file dengan format .jpg, .jpeg, atau .png yang diizinkan.",
      });
      return;
    }

    // Validasi ukuran file
    if (file.size / 1024 / 1024 > maxSizeInMB) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran File Terlalu Besar",
        text: `Ukuran file maksimal adalah ${maxSizeInMB} MB.`,
      });
      return;
    }

    try {
      // Upload file ke server menggunakan fungsi uploadFile
      const uploadResponse = await uploadFile(file);
      console.log("Upload Response:", uploadResponse);

      // Pastikan menggunakan nama properti yang benar dari respons server
      if (!uploadResponse || !uploadResponse.Hasil) {
        throw new Error("Respon server tidak valid.");
      }

      // Perbarui data pertanyaan dengan file gambar
      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        selectedFile: file, // Menyimpan file untuk akses nanti
        gambar: uploadResponse.Hasil, // Nama file yang dikembalikan server
        previewUrl: URL.createObjectURL(file), // Untuk preview
      };
      setFormContent(updatedFormContent);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };


  console.log("data materi", AppContext_test.activeUser)

  const [dataSection, setDataSection] = useState({
    materiId: Materi.Key,
    secJudul: "Section Materi " + Materi.Key,
    createdby: AppContext_test.activeUser,
    secType: "",
  });


  const handleAdd = async (e) => {
    e.preventDefault();

    formData.timer = convertTimeToSeconds(timer);

    const validationErrors = await validateAllInputs(
        formData,
        userSchema,
        setErrors
    );

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        Swal.fire({
            title: "Gagal!",
            text: "Pastikan semua data terisi dengan benar!",
            icon: "error",
            confirmButtonText: "OK",
        });

        return;
    }

    // Validasi total skor
    const totalQuestionPoint = formContent.reduce((total, question) => {
        if (question.type !== "Pilgan") {
            total += parseInt(question.point);
        }
        return total;
    }, 0);

    const totalOptionPoint = formContent.reduce((total, question) => {
        if (question.type === "Pilgan") {
            return total + question.options.reduce(
                (optionTotal, option) => optionTotal + parseInt(option.point || 0),
                0
            );
        }
        return total;
    }, 0);

    if (totalQuestionPoint + totalOptionPoint !== 100) {
        setResetStepper((prev) => !prev + 1);
        Swal.fire({
            title: "Gagal!",
            text: `Total skor harus berjumlah 100. Saat ini skor berjumlah: ${totalQuestionPoint + totalOptionPoint}`,
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    if (hours === "00" && minutes === "00") {
      Swal.fire({
        title: "Error!",
        text: "Durasi tidak boleh 0 jam 0 menit.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return; // Pastikan return menghentikan eksekusi jika durasi invalid
    }

    try {
        // Step 1: Create Section
        const sectionResponse = await axios.post(API_LINK + "Section/CreateSection", dataSection);
        const sectionData = sectionResponse.data;

        if (sectionData[0]?.hasil === "OK") {
            const sectionId = sectionData[0].newID;

            AppContext_master.dataIdSectionPretest = sectionId;
            console.log("id section:", sectionId);
            formData.timer = convertTimeToSeconds(timer);
            console.log("Timer setelah konversi:", formData.timer);

            const quizResponse = await axios.post(API_LINK + "Quiz/SaveDataQuiz", {
                materiId: Materi.Key,
                sec_id: sectionId, // Menggunakan nilai yang baru dibuat
                quizDeskripsi: formData.quizDeskripsi,
                quizTipe: "Pretest",
                tanggalAwal: "",
                tanggalAkhir: "",
                timer: formData.timer,
                status: "Aktif",
                createdby: activeUser,
                type: "Pre-Test",
            });

            if (quizResponse.data.length === 0) {
                Swal.fire({
                    title: "Gagal!",
                    text: "Data yang dimasukkan tidak valid atau kurang",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }

            const quizId = quizResponse.data[0].hasil;

            // Step 3: Save Questions and Answers
            for (const question of formContent) {
                const formQuestion = {
                    quizId: quizId,
                    soal: question.text,
                    tipeQuestion: question.type,
                    gambar: question.gambar ?? "",
                    status: "Aktif",
                    quecreatedby: activeUser,
                    point: question.point,
                };

                const uploadPromises = [];
                if (question.type === "Essay" || question.type === "Praktikum") {
                  if (question.selectedFile) {
                    try {
                      const uploadResult = await uploadFile(question.selectedFile);
                      formQuestion.gambar = uploadResult.Hasil;
        
                      console.log("Gam", formQuestion.gambar);
                    } catch (uploadError) {
                      console.error("Gagal mengunggah gambar:", uploadError);
                      Swal.fire({
                        title: "Gagal!",
                        text: `Gagal mengunggah gambar untuk pertanyaan: ${question.text}`,
                        icon: "error",
                        confirmButtonText: "OK",
                      });
                      return;
                    }
                  } else {
                    formQuestion.gambar = "";
                  }
                } else if (question.type === "Pilgan") {
                  formQuestion.gambar= "";
                }

                try {
                  await Promise.all(uploadPromises);
                  const questionResponse = await axios.post(
                    API_LINK + "Question/SaveDataQuestion",
                    formQuestion
                  );
                  console.log("pertanyaan", formQuestion);
                  if (questionResponse.data.length === 0) {
                    Swal.fire({
                      title: "Gagal!",
                      text: "Data yang dimasukkan tidak valid atau kurang",
                      icon: "error",
                      confirmButtonText: "OK",
                    });
                    return;
                  }
        
                  const questionId = questionResponse.data[0].hasil;
        
                  if (question.type === "Essay" || question.type === "Praktikum") {
                    const answerData = {
                      urutanChoice: "",
                      answerText: question.correctAnswer ? question.correctAnswer : "0",
                      questionId: questionId,
                      nilaiChoice: question.point,
                      quecreatedby: activeUser,
                    };
        
                    try {
                      const answerResponse = await axios.post(
                        API_LINK + "Choice/SaveDataChoice",
                        answerData
                      );
                      console.log("jawaban", answerData);
                    } catch (error) {
                      console.error("Gagal menyimpan jawaban Essay:", error);
                      Swal.fire({
                        title: "Gagal!",
                        text: "Data yang dimasukkan tidak valid atau kurang",
                        icon: "error",
                        confirmButtonText: "OK",
                      });
                    }
                  } else if (question.type === "Pilgan") {
                    for (const [optionIndex, option] of question.options.entries()) {
                      const answerData = {
                        urutanChoice: optionIndex + 1,
                        answerText: option.label,
                        questionId: questionId,
                        nilaiChoice: option.point || 0,
                        quecreatedby: activeUser,
                        cho_tipe: question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
                      };
        
                      try {
                        const answerResponse = await axios.post(
                          API_LINK + "Choice/SaveDataChoice",
                          answerData
                        );
                        console.log("jawaban", answerData);
                      } catch (error) {
                        console.error(
                          "Gagal menyimpan jawaban multiple choice:",
                          error
                        );
                        Swal.fire({
                          title: "Gagal!",
                          text: "Data yang dimasukkan tidak valid atau kurang",
                          icon: "error",
                          confirmButtonText: "OK",
                        });
                      }
                    }
                  }
                  setResetStepper((prev) => !prev + 1);
                } catch (error) {
                  console.error("Gagal menyimpan pertanyaan:", error);
                  Swal.fire({
                    title: "Gagal!",
                    text: "Data yang dimasukkan tidak valid atau kurang",
                    icon: "error",
                    confirmButtonText: "OK",
                  });
                }
              }
              Swal.fire({
                title: "Berhasil!",
                text: "Pretest berhasil ditambahkan",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                setFormContent([]);
                setSelectedOptions([]);
                setErrors({});
                setTimer("");
                setIsButtonDisabled(true);
                window.location.reload();
            });
        } else {
            Swal.fire({
                title: "Gagal!",
                text: "Terjadi kesalahan saat menyimpan data Section.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menyimpan data.",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
};

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].options[optionIndex].label = value;
      return updatedFormContent;
    });
  };


  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { checked } = e.target;
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[questionIndex];
  
    // Perbarui opsi berdasarkan apakah "Tunggal" atau "Jamak"
    if (question.jenis === "Tunggal") {
      // Reset semua opsi lain jika tipe Tunggal
      question.options.forEach((option, idx) => {
        option.isChecked = idx === optionIndex; // Hanya aktifkan opsi yang dipilih
        option.point = idx === optionIndex ? option.point : 0; // Reset poin selain yang dipilih
      });
    } else if (question.jenis === "Jamak") {
      // Update opsi tanpa mereset yang lain
      question.options[optionIndex].isChecked = checked;
      if (!checked) {
        question.options[optionIndex].point = 0; // Reset poin jika opsi tidak dipilih
      }
    }
    setFormContent(updatedFormContent);
  };


  const handleChangeQuestion = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    if (question.type === "Essay") {
      // Simpan jawaban benar untuk pertanyaan Essay ke state
      setCorrectAnswers((prevCorrectAnswers) => ({
        ...prevCorrectAnswers,
        [index]: question.correctAnswer,
      }));
    }

    const newType =
      question.type !== "answer"
        ? question.options.length > 0
          ? "answer"
          : "answer"
        : question.options.length > 0
        ? "Pilgan"
        : "Pilgan";

    updatedFormContent[index] = {
      ...question,
      type: newType,
      options: newType === "Essay" ? [] : question.options,
    };

    setFormContent(updatedFormContent);
  };

  const handleDuplicateQuestion = (index) => {
    const duplicatedQuestion = { ...formContent[index] };
    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });
    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, selectedOptions[index]);
      return updatedSelectedOptions;
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent.splice(index, 1);
    setFormContent(updatedFormContent);
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions.splice(index, 1);
    setSelectedOptions(updatedSelectedOptions);
    const updatedCorrectAnswers = { ...correctAnswers };
    delete updatedCorrectAnswers[index];
    setCorrectAnswers(updatedCorrectAnswers);
  };

  const parseExcelData = (data) => {
    const questions = data
      .map((row, index) => {
        // Skip header row (index 0) and the row di bawahnya (index 1)
        if (index < 2) return null;

        const options = row[3] ? row[3].split(",") : []; // Pilihan Jawaban
        const bobotPilgan = row[4] ? row[4].split(",").map(Number) : []; // Bobot Pilgan
        const jenis = row[2]?.toLowerCase(); // Jenis soal
        const totalNonZero = bobotPilgan.filter((bobot) => bobot !== 0).length;

        return {
          text: row[1], // Soal
          type:
            jenis === "pilgan"
              ? "Pilgan"
              : jenis === "essay"
              ? "Essay"
              : "Praktikum",
          jenis:
            jenis === "pilgan"
              ? totalNonZero > 1
                ? "Jamak"
                : "Tunggal"
              : null, // Deteksi jamak/tunggal
          options:
            jenis === "pilgan"
              ? options.map((option, idx) => ({
                  label: option.trim(),
                  point: bobotPilgan[idx] || 0, // Bobot masing-masing pilihan
                  isChecked: bobotPilgan[idx] > 0, // Pilihan aktif jika bobotnya > 0
                }))
              : [],
          point:
            jenis === "essay" || jenis === "praktikum"
              ? parseInt(row[5] || 0, 10)
              : null, // Total skor untuk Essay/Praktikum
        };
      })
      .filter(Boolean);

    setFormContent((prevQuestions) => [...prevQuestions, ...questions]);
  };
  

  const handleFileExcel = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Silahkan unggah berkas dengan format: .xls atau .xlsx",
      });
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        parseExcelData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
      Swal.fire({
        title: "Berhasil!",
        text: "File Excel berhasil ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Gagal!",
        text: "Pilih file Excel terlebih dahulu!",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx";
    link.download = "template.xlsx";
    link.click();
  };

  const updateFormQuestion = (name, value) => {
    setFormQuestion((prevFormQuestion) => ({
      ...prevFormQuestion,
      [name]: value,
    }));
  };

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
  
    // Update poin hanya jika opsi dipilih
    if (updatedFormContent[questionIndex].options[optionIndex].isChecked) {
      updatedFormContent[questionIndex].options[optionIndex].point = parseInt(value, 10);
    }
    setFormContent(updatedFormContent);
  };



  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };
  const convertTimeToSeconds = () => {
    const hoursInSeconds = parseInt(hours, 10) * 3600;
    const minutesInSeconds = parseInt(minutes, 10) * 60;
    return hoursInSeconds + minutesInSeconds;
  };

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  const handleHoursChange = (e) => {
    setHours(e.target.value);
  };

  const handleMinutesChange = (e) => {
    setMinutes(e.target.value);
  };



  if (isLoading) return <Loading />;

  const handlePageChange = (content) => {
    onChangePage(content);
};

  return (
    <>
      <style>
        {`
          .form-check input[type="radio"] {
            transform: scale(1.5);
            border-color: #000;
          }
          .file-name {
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 100%;
          }
          .option-input {
            background: transparent;
            border: none;
            outline: none;
            border-bottom: 1px solid #000;
            margin-left: 20px;
          }
          .form-check {
            margin-bottom: 8px;
          }
          .question-input {
            margin-bottom: 12px;
          }
          .file-upload-label {
            font-size: 14px; /* Sesuaikan ukuran teks label */
          }
          .file-ket-label {
            font-size: 10px; /* Sesuaikan ukuran teks label */
          }
        `}
      </style>
      <div
        className=""
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "100px",
          marginLeft: "70px",
          marginRight: "70px",
        }}
      >
        <div className="back-and-title" style={{ display: "flex" }}>
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
            Tambah Pre-Test
          </h4>
        </div>
        <div className="ket-draft">
          <span className="badge text-bg-dark " style={{ fontSize: "16px" }}>
            Draft
          </span>
        </div>
      </div>
      <form id="myForm" onSubmit={handleAdd}>
      <div>
          <CustomStepper
            activeStep={4}
            steps={steps}
            onChangePage={handlePageChange}
            getStepContent={getStepContent}
          />
        </div>
        <div className="card mt-4" style={{ margin: "100px" }}>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-lg-7">
                <Input
                  type="text"
                  label="Deskripsi"
                  forInput="quizDeskripsi"
                  value={formData.quizDeskripsi}
                  onChange={handleInputChange}
                  isRequired={true}
                  style={{ width: "100%" }}
                  errorMessage={errors.quizDeskripsi}
                />
              </div>
              <div className="col-lg-4">
                <label htmlFor="waktuInput" className="form-label">
                  <span style={{ fontWeight: "bold" }}>Durasi:</span>
                  <span style={{ color: "red" }}> *</span>
                </label>

                <div className="d-flex">
                  <div className="d-flex align-items-center me-3">
                    <select
                      className="form-select me-2"
                      name="hours"
                      value={hours}
                      onChange={handleHoursChange}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>Jam</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-select me-2"
                      name="minutes"
                      value={minutes}
                      onChange={handleMinutesChange}
                    >
                      {[...Array(60)].map((_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>Menit</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-4">
              <div className="mb-2"></div>
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <div className="">
                    <Button
                      title="Tambah Pertanyaan"
                      onClick={() => addQuestion("Essay")}
                      iconName="plus"
                      label="Tambah Soal"
                      classType="primary btn-sm px-3 py-2 rounded-3 fw-semibold"
                    />
                    <input
                      type="file"
                      id="fileInput"
                      style={{ display: "none" }}
                      onChange={handleFileExcel}
                      accept=".xls, .xlsx"
                    />
                  </div>
                  <div className="ml-3">
                    <Button
                      title="Tambah File Excel"
                      iconName="upload"
                      label="Tambah File Excel"
                      classType="primary btn-sm mx-2 px-3 py-2 rounded-3 fw-semibold"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      } // Memicu klik pada input file
                    />
                  </div>
                </div>
                {/* Tampilkan nama file yang dipilih */}
                {selectedFile && <span>{selectedFile.name}</span>}
                <br></br>
                <br></br>
                <div className="d-flex ">
                  <div className="mr-4">
                    <Button
                      title="Unggah File Excel"
                      iconName="paper-plane"
                      classType="primary btn-sm px-3 py-2 rounded-3 fw-semibold"
                      onClick={handleUploadFile}
                      label="Unggah File"
                    />
                  </div>
                  <div className="">
                    <Button
                      iconName="download"
                      label="Unduh Template"
                      classType="warning btn-sm px-3 py-2 mx-2 rounded-3 fw-semibold"
                      onClick={handleDownloadTemplate}
                      title="Unduh Template Excel"
                    />
                  </div>
                </div>
              </div>
            </div>
            {formContent.map((question, index) => (
              <div key={index} className="card mb-4">
                <div className="card-header bg-white fw-medium text-black d-flex justify-content-between align-items-center">
                  <span>Pertanyaan</span>
                  <span>
                    Skor:{" "}
                    {question.type === "Pilgan"
                      ? (question.options || []).reduce(
                          (acc, option) => acc + parseInt(option.point),
                          0
                        )
                      : parseInt(question.point)}
                  </span>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      value={question.type}
                      onChange={(e) => handleQuestionTypeChange(e, index)}
                    >
                      <option value="Essay">Essay</option>
                      <option value="Pilgan">Pilihan Ganda</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>
                </div>
                <div className="card-body p-4">
                  {question.type === "answer" ? (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                        <Input
                          type="text"
                          label={`Question ${index + 1}`}
                          forInput={`questionText-${index}`}
                          value={question.text}
                          onChange={(e) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = e.target.value;
                            setFormContent(updatedFormContent);
                            updateFormQuestion("soal", e.target.value);
                          }}
                          isRequired={true}
                        />
                      </div>

                      <div className="col-lg-12">
                        <div className="form-check">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex}>
                              <input
                                type="radio"
                                id={`option_${index}_${optionIndex}`}
                                name={`option_${index}`}
                                value={option.value}
                                // Checked hanya jika value di selectedOptions sama dengan value dari option
                                checked={
                                  selectedOptions[index] === option.value
                                }
                                onChange={(e) => handleOptionChange(e, index)}
                                style={{ marginRight: "5px" }}
                              />
                              <label htmlFor={`option_${index}_${optionIndex}`}>
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>

                        <Input
                          type="number"
                          label="Point"
                          value={question.point}
                          onChange={(e) => handlePointChange(e, index)}
                        />
                        <Button
                          classType="primary btn-sm ms-2 px-3 py-1"
                          label="Done"
                          onClick={() => handleChangeQuestion(index)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                        <label
                          htmlFor="deskripsiMateri"
                          className="form-label fw-bold"
                        >
                          Pertanyaan <span style={{ color: "Red" }}> *</span>
                        </label>
                        <Editor
                          id={`pertanyaan_${index}`}
                          value={question.text}
                          onEditorChange={(content) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = content;
                            setFormContent(updatedFormContent);

                            // Update formQuestion.soal
                            setFormQuestion((prevFormQuestion) => ({
                              ...prevFormQuestion,
                              soal: content,
                            }));
                          }}
                          apiKey="444kasui9s3azxih6ix4chynoxmhw6y1urkpmfhufvrbernz"
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              "advlist autolink lists link image charmap print preview anchor",
                              "searchreplace visualblocks code fullscreen",
                              "insertdatetime media table paste code help wordcount",
                            ],
                            toolbar:
                              "undo redo | formatselect | bold italic backcolor | " +
                              "alignleft aligncenter alignright alignjustify | " +
                              "bullist numlist outdent indent | removeformat | help",
                          }}
                        />
                      </div>

                      {/* Tampilkan tombol gambar dan PDF hanya jika type = Essay */}
                      {(question.type === "Essay" ||
                        question.type === "Praktikum") && (
                        <div className="d-flex flex-column w-100">
                        <FileUpload
                                forInput={`fileInput_${index}`}
                                formatFile=".jpg,.jpeg,.png"
                                label={
                                  <span className="file-upload-label">
                                    Gambar (.jpg, .jpeg, .png)
                                  </span>
                                }
                                onChange={(e) => handleFileChange(e, index)}
                                hasExisting={formContent[index]?.img || null}
                                style={{ fontSize: "12px" }}
                              />

                              {/* Tampilkan preview gambar jika ada gambar yang dipilih */}
                              {question.previewUrl && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    overflow: "hidden",
                                    borderRadius:"20px"
                                  }}
                                >
                                  <img
                                    src={question.previewUrl}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              )}

                          <div className="mt-2">
                            <Input
                              type="number"
                              label="Skor"
                              value={question.point}
                              onChange={(e) => handlePointChange(e, index)}
                              isRequired={true}
                            />
                          </div>
                        </div>
                      )}

                      {question.type === "Pilgan" && (
                        <>
                          {/* Dropdown untuk memilih jenis Pilihan */}
                          <div
                            className="col-lg-2 mb-3"
                            style={{ width: "250px" }}
                          >
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={question.jenis}
                              onChange={(e) => handleJenisTypeChange(e, index)}
                            >
                              <option value="Tunggal">Pilihan Tunggal</option>
                              <option value="Jamak">Pilihan Jamak</option>
                            </select>
                          </div>

                          {/* Daftar Opsi */}
                          <div className="col-lg-12">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="form-check"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "10px",
                                  marginLeft: "-15px",
                                }}
                              >
                                {/* Input Radio atau Checkbox berdasarkan jenis Pilihan */}
                                <input
                                  type={question.jenis === "Tunggal" ? "radio" : "checkbox"}
                                  id={`option_${index}_${optionIndex}`}
                                  name={`option_${index}`}
                                  value={option.value}
                                  checked={!!option.isChecked}
                                  onChange={(e) => handleOptionChange(e, index, optionIndex)}
                                  style={{ marginRight: "10px" }}
                                />

                                {/* Input Label Opsi */}
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) =>
                                    handleOptionLabelChange(
                                      e,
                                      index,
                                      optionIndex
                                    )
                                  }
                                  readOnly={question.type === "answer"}
                                  style={{
                                    marginRight: "10px",
                                    padding: "5px",
                                    borderRadius: "10px",
                                    border: "1px solid grey",
                                  }}
                                />
                                 <Button
                                  iconName="delete"
                                  classType="btn-sm ms-2 px-2 py-1"
                                  onClick={() =>
                                    handleDeleteOption(index, optionIndex)
                                  }
                                  style={{
                                    marginRight: "10px",
                                    backgroundColor: "red",
                                    color: "white",
                                  }}
                                />
                                {/* Input Poin hanya tampil jika opsi dipilih */}
                                {option.isChecked && (
                                  <input
                                    type="number"
                                    id={`optionPoint_${index}_${optionIndex}`}
                                    value={option.point}
                                    className="btn-sm ms-2 px-2 py-0"
                                    onChange={(e) =>
                                      handleOptionPointChange(
                                        e,
                                        index,
                                        optionIndex
                                      )
                                    }
                                    style={{ width: "50px" }}
                                  />
                                )}

                                {/* Tombol Hapus Opsi */}
                               
                              </div>
                            ))}

                            {/* Tombol Tambah Opsi Baru */}
                            <Button
                              onClick={() => handleAddOption(index)}
                              iconName="add"
                              classType="success btn-sm px-3 py-2 mt-2 rounded-3"
                              label="Opsi Baru"
                            />
                          </div>
                        </>
                      )}

                      <div className="d-flex justify-content-between my-2 mx-1">
                        <div></div>
                        <div className="d-flex">
                          <div className="mr-3">
                            <Button
                              iconName="trash"
                              label="Hapus"
                              classType="btn-sm ms-2 px-3 py-2 fw-semibold rounded-3"
                              style={{ backgroundColor: "red", color: "white" }}
                              onClick={() => handleDeleteQuestion(index)}
                            />
                          </div>
                          <div className="mr-4">
                            <Button
                              iconName="duplicate"
                              label="Duplikat"
                              classType="primary btn-sm ms-2 px-3 py-2 fw-semibold rounded-3 "
                              onClick={() => handleDuplicateQuestion(index)}
                            />
                          </div>
                          <div className="">
                            <Button
                              title="Tambah Pertanyaan"
                              onClick={() => addQuestion("Essay")}
                              iconName="plus"
                              label="Tambah Soal"
                              classType="primary btn-sm px-3 py-2 fw-semibold rounded-3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
            <div className="ml-4">
            <Button
                        classType="outline-secondary me-2 px-4 py-2"
                        label="Sebelumnya"
                        onClick={() => onChangePage("sharingEdit", AppContext_test.ForumForm, AppContext_master.MateriForm , AppContext_master.count += 1)}
                      />
            </div>
            <div className="d-flex mr-4" >
            <Button
                            classType="primary ms-2 px-4 py-2"
                            type="submit"
                            label="Simpan"
                            onClick={handleAdd}
                        />
                      <Button
                        classType="primary ms-3 px-4 py-2"
                        label="Berikutnya"
                        onClick={() => onChangePage("posttestEdit", AppContext_master.MateriForm, AppContext_master.count += 1)}
                      />
                      </div>
          </div>
        </div>
      </form>
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
