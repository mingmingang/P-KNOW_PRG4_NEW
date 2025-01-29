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
import uploadFile from "../../../../util/UploadImageQuiz";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import AppContext_master from "../../master-test/TestContext";
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import { Stepper, Step, StepLabel, Box, colors } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";

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
      return "pengenalanEdit";
    case 1:
      return "materiEdit";
    case 2:
      return "forumEdit";
    case 3:
      return "sharingEdit";
    case 4:
      return "pretestEdit";
    case 5:
      return "posttestEdit";
    default:
      return "Unknown stepIndex";
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

export default function MasterPreTestEdit({ onChangePage, withID }) {
  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [deletedChoices, setDeletedChoices] = useState([]);

  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  
  const [formData, setFormData] = useState({
    quizId: "",
    materiId: "",
    quizJudul: "",
    quizDeskripsi: "",
    quizTipe: "Pretest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    modifby: activeUser,
  });

  const filteredData = {
    quizId: formData.quizId,
    materiId: formData.materiId,
    quizJudul: formData.quizJudul,
    quizDeskripsi: formData.quizDeskripsi,
    quizTipe: formData.quizTipe,
    tanggalAwal: formData.tanggalAwal,
    tanggalAkhir: formData.tanggalAkhir,
    timer: formData.timer,
    status: formData.status,
    modifby: formData.modifby,
  };

  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: "",
    questionDeskripsi: "",
    status: "Aktif",
    quemodifby: activeUser,
  });

  // formData.timer = timer;

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quemodifby: activeUser,
  });

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    window.location.reload();
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const userSchema = object({
    quizId: string(),
    materiId: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string().required("Tanggal awal harus diisi"),
    tanggalAkhir: string().required("Tanggal akhir harus diisi"),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    modifby: string(),
  });

  const initialFormQuestion = {
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: "",
    questionDeskripsi: "",
    status: "Aktif",
    quemodifby: activeUser,
  };

  /* ----- Handle Function Start ---- */

  const Materi = AppContext_master.DetailMateriEdit;
  console.log("dataa", Materi)

  const hasTest = Materi.Pretest !== null && Materi.Pretest !== "";

  useEffect(() => {
    console.log("Materi:", Materi);
    console.log("Materi.Pretest:", Materi?.Pretest);
    console.log("hasTest:", hasTest);
  }, [Materi, hasTest]);

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target; // Ambil jenis baru (Tunggal/Jamak)

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      const question = updatedFormContent[questionIndex];

      // Perbarui jenis pilihan
      question.jenis = value;

      let choicesToDelete = [];
      if (value === "Jamak") {
        // Untuk "Jamak", hapus semua opsi yang memiliki isChecked sebagai false
        choicesToDelete = question.options
          .filter((option) => !option.isChecked && option.id) // Ambil ID opsi yang tidak dicentang
          .map((option) => option.id);

        // Reset semua opsi agar tidak dicentang
        question.options = question.options.filter(
          (option) => option.isChecked
        );
        question.options.forEach((option) => {
          option.isChecked = false;
        });
      } else if (value === "Tunggal") {
        // Untuk "Tunggal", hapus semua kecuali opsi pertama yang dicentang
        const firstCheckedOption = question.options.find(
          (option) => option.isChecked
        );

        // Ambil opsi yang akan dihapus (tidak relevan untuk jenis Tunggal)
        choicesToDelete = question.options
          .filter((option) => option.id && option !== firstCheckedOption)
          .map((option) => option.id);

        // Reset semua opsi dan hanya pertahankan satu yang dicentang
        question.options = firstCheckedOption
          ? [firstCheckedOption]
          : question.options.slice(0, 1); // Pertahankan opsi pertama jika tidak ada yang dicentang
        question.options.forEach((option, idx) => {
          option.isChecked = idx === 0; // Pastikan hanya satu yang dicentang
        });
      }

      // Simpan ID opsi yang dihapus ke deletedChoices
      setDeletedChoices((prev) => [...prev, ...choicesToDelete]);

      return updatedFormContent;
    });
  };



  async function fetchSectionAndQuizData() {
    setIsLoading(true);
    try {
      const sectionResponse = await axios.post(
        API_LINK + "Section/GetDataSectionByMateri",
        {
          p1: Materi.Key,
          p2: "Pre-Test",
          p3: "Aktif",
        }
      );
      const sectionData = sectionResponse.data;

      if (sectionData.length === 0) {
        throw new Error("Section data not found.");
      }

      const sectionId = sectionData[0].SectionId;

      console.log("Section ID:", sectionId);

      // Fetch quiz data using sectionId
      const quizResponse = await axios.post(
        API_LINK + "Quiz/GetDataQuizByIdSection",
        {
          secId: sectionId,
        }
      );
      const quizData = quizResponse.data;

      if (quizData.length === 0) {
        throw new Error("Quiz data not found.");
      }

      // Process quiz data
      const convertedData = {
        ...quizData[0],
        tanggalAwal: quizData[0]?.tanggalAwal
          ? new Date(quizData[0].tanggalAwal).toISOString().split("T")[0]
          : "",
        tanggalAkhir: quizData[0]?.tanggalAkhir
          ? new Date(quizData[0].tanggalAkhir).toISOString().split("T")[0]
          : "",
      };

      setTimer(
        quizData[0]?.timer ? convertSecondsToTimeFormat(quizData[0].timer) : ""
      );
      
      setFormData(convertedData);
      console.log("Quiz Data:", convertedData);
    } catch (error) {
      console.error("Error:", error.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  // Call the combined function when the component mounts
  useEffect(() => {
    fetchSectionAndQuizData();
  }, []);

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const { data } = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
          quiId: formData.quizId,
        });
        console.log("id qui", formData.quizId);
        console.log("Data mentah dari API:", data);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedQuestions = {};
          const filePromises = [];

          data.forEach((question) => {
            // Jika pertanyaan sudah ada di formattedQuestions, tambahkan opsi baru
            if (question.Key in formattedQuestions) {
              if (question.TipeSoal === "Pilgan") {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            } else {
              // Tambahkan pertanyaan baru
              formattedQuestions[question.Key] = {
                type: question.TipeSoal,
                text: question.Soal,
                options: question.TipeSoal === "Pilgan" ? [] : [],
                jenis: question.TipePilihan, // Tambahkan properti jenis
                gambar: question.Gambar || "",
                img: question.Gambar || "",
                point: question.NilaiJawaban,
                key: question.Key,
                correctAnswer:
                  question.TipeSoal === "Essay"
                    ? question.JawabanBenar || ""
                    : null,
              };
              console.log(
                "Data yang diproses ke formContent:",
                formattedQuestions[question.Key]
              );

              if (question.TipeSoal === "Pilgan" && question.JawabanId) {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            }

            console.log("formContent initial state:", formContent);

            // Jika ada gambar, fetch gambar
            if (question.Gambar) {
              const gambarPromise = fetch(
                `${API_LINK}Utilities/DownloadFile?namaFile=${encodeURIComponent(
                  question.Gambar
                )}`
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(
                      `Error fetching gambar: ${response.status} ${response.statusText}`
                    );
                  }
                  return response.blob();
                })
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  formattedQuestions[question.Key].gambar = url;
                })
                .catch((error) => {
                  console.error("Error fetching gambar:", error.message);
                });

              filePromises.push(gambarPromise);
            }
          });

          // Tambahkan setelah forEach selesai memproses data pertanyaan
          Object.keys(formattedQuestions).forEach((key) => {
            if (formattedQuestions[key].options.length > 0) {
              formattedQuestions[key].options.sort(
                (a, b) => a.urutan - b.urutan
              );
            }
          });

          await Promise.all(filePromises);
          const formattedQuestionsArray = Object.values(formattedQuestions);
          setFormContent(formattedQuestionsArray);
          console.log("question", formattedQuestionsArray);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

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

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;

    // Parse value to integer
    const pointValue = parseInt(value, 10) || 0;

    // Create a copy of formContent
    const updatedFormContent = formContent.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        // Update the specific option's point value
        const updatedOptions = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return {
              ...option,
              point: pointValue,
            };
          }
          return option;
        });

        // Calculate total points for the question
        const totalPoints = updatedOptions.reduce(
          (acc, opt) => acc + opt.point,
          0
        );

        // Return updated question with updated options and total points
        return {
          ...question,
          options: updatedOptions,
          point: totalPoints,
        };
      }
      return question;
    });

    // Update formContent state
    setFormContent(updatedFormContent);
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

  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "", // Default correctAnswer
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };

  // Baru untuk handleQuestionTypeChange
  const handleQuestionTypeChange = async (e, index) => {
    const newType = e.target.value; // Tipe baru
    const questionId = formContent[index].key; // ID soal

    // Perbarui tipe soal di state frontend
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = newType;

    if (newType === "Pilgan") {
      // Set default jenis ke Tunggal jika tipe diubah ke Pilgan
      updatedFormContent[index].jenis = "Tunggal";
      updatedFormContent[index].options = []; // Reset opsi
    }

    setFormContent(updatedFormContent);

    try {
      // Kirim request untuk memanggil stored procedure
      const response = await axios.post(API_LINK + "Question/SetTypeQuestion", {
        p1: questionId, // ID soal
        p2: newType, // Tipe baru
      });

      console.log("Tipe quest", response.data);
    } catch (error) {
      console.error("Gagal memperbarui tipe soal:", error.message);
      Swal.fire("Error", "Gagal memperbarui tipe soal.", "error");
    }
  };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    const newOption = {
      id: null,
      label: "",
      value: "",
      point: 0,
      isChecked: false, // Default to unchecked
    };

    question.options.push(newOption);
    setFormContent(updatedFormContent);
  };


  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { checked } = e.target;
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[questionIndex];
    // if (question.options && Array.isArray(question.options)) {
    //   question.options.forEach((option, idx) => {
    //     option.isChecked = idx === optionIndex;
    //   });
    // }
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


  const handleDuplicateQuestion = (index) => {
    const questionToDuplicate = { ...formContent[index] };
    const duplicatedQuestion = {
      ...questionToDuplicate,
      key: null, // Menandakan ini adalah pertanyaan baru
      options: questionToDuplicate.options.map((option) => ({
        ...option,
        id: null, // Menandakan ini adalah opsi baru
      })),
    };

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });

    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, "");
      return updatedSelectedOptions;
    });
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    const deletedOption =
      updatedFormContent[questionIndex].options[optionIndex];

    if (deletedOption.id) {
      setDeletedChoices((prev) => [...prev, deletedOption.id]);
    }

    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
  };

  const handleDeleteQuestion = (index) => {
    const question = formContent[index];
    const questionId = question.key; // Pastikan key adalah question ID

    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pertanyaan ini akan dihapus permanen setelah Anda menyimpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Jika pertanyaan adalah Pilihan Ganda, hapus semua opsi terkait terlebih dahulu
          if (question.type === "Pilgan") {
            for (const choice of question.options) {
              if (choice.id) {
                await deleteChoiceAPI(choice.id);
              }
            }
          }

          // Panggil API untuk menghapus pertanyaan
          const response = await axios.post(
            API_LINK + "Question/DeleteQuestion",
            {
              p1: questionId,
            }
          );

          // Periksa apakah penghapusan berhasil
          if (response.data === null) {
            Swal.fire({
              title: "Gagal Dihapus!",
              text: "Pertanyaan tidak dapat dihapus karena telah dijawab pada pengerjaan Pre-Test.",
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          // Jika berhasil, lanjutkan penghapusan dari state lokal
          const updatedFormContent = [...formContent];
          updatedFormContent.splice(index, 1);
          setFormContent(updatedFormContent);

          Swal.fire(
            "Dihapus!",
            "Pertanyaan telah dihapus sementara.",
            "success"
          );
        } catch (error) {
          console.error("Gagal menghapus pertanyaan:", error.message);
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus pertanyaan.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const deleteChoiceAPI = async (choiceId) => {
    try {
      const response = await axios.post(API_LINK + "Choice/DeleteChoice", {
        p1: choiceId,
      });
      console.log("Choice Deletion Response:", response.data);
    } catch (error) {
      console.error("Error deleting choice:", error);
    }
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
        return response.data; // Pastikan ini berisi `newFileName`
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
    if (!file) {
      console.log(
        "Tidak ada file yang diunggah, tidak ada perubahan pada gambar."
      );
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const maxSizeInMB = 10; // Maksimum ukuran file (dalam MB)

    // Validasi ekstensi file
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
      const uploadResponse = await uploadFile(file);
      const fileName = uploadResponse.Hasil;

      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        // selectedFile: file, // Simpan file baru
        gambar: fileName, // Nama file baru dari server
        previewUrl: URL.createObjectURL(file), // URL untuk preview
      };
      console.log("File yang diunggah:", file);
      console.log("Nama file dari server:", fileName);
      console.log("Index pertanyaan:", index);

      setFormContent(updatedFormContent);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };


  const [isSaving, setIsSaving] = useState(false);

  const validateTotalPoints = () => {
    const totalPoints = formContent.reduce((total, question) => {
      if (["Essay", "Praktikum"].includes(question.type)) {
        return total + parseInt(question.point || 0, 10);
      } else if (question.type === "Pilgan") {
        return (
          total +
          question.options.reduce(
            (optTotal, opt) => optTotal + parseInt(opt.point || 0, 10),
            0
          )
        );
      }
      return total;
    }, 0);

    return totalPoints;
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
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      formData.timer = convertTimeToSeconds(timer);

      // **1. Update Data Quiz**
      const quizPayload = {
        quizId: formData.quizId,
        materiId: formData.materiId,
        quizJudul: formData.quizJudul,
        quizDeskripsi: formData.quizDeskripsi,
        quizTipe: formData.quizTipe,
        tanggalAwal: formData.tanggalAwal,
        tanggalAkhir: formData.tanggalAkhir,
        timer: formData.timer, // Pastikan timer dalam format detik
        status: "Aktif",
        modifby: activeUser,
      };

      const quizResponse = await axios.post(
        API_LINK + "Quiz/UpdateDataQuiz",
        quizPayload
      );

      console.log("Respons dari API UpdateDataQuiz:", quizResponse.data);

      if (!quizResponse.data.length) {
        Swal.fire({
          title: "Error!",
          text: "Gagal menyimpan quiz.",
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }
      // Validasi total poin
      const totalPoints = validateTotalPoints();
      if (totalPoints !== 100) {
        Swal.fire({
          title: "Error!",
          text: `Total poin untuk semua pertanyaan harus 100. Saat ini: ${totalPoints}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }

      // **1. Hapus pilihan lama yang ada di deletedChoices**
      for (const choiceId of deletedChoices) {
        try {
          await deleteChoiceAPI(choiceId);
        } catch (error) {
          console.error(
            `Gagal menghapus pilihan dengan ID ${choiceId}:`,
            error
          );
        }
      }

      // **2. Simpan pertanyaan dan pilihan baru**
      for (const question of formContent) {
        let payload;

        const isBlobUrl = question.gambar?.startsWith("blob:") || false;
        const finalGambar = isBlobUrl ? question.img : question.gambar;
        if (!question.key) {
          // Parameter untuk CREATE
          payload = {
            p1: formData.quizId, // ID Quiz
            p2: question.text, // Soal
            p3: question.type, // Tipe Soal
            p4: finalGambar || "",
            p5: "Aktif", // Status
            p6: activeUser, // Created By
            p7: question.point || 0, // Poin
          };

          console.log("Payload Create Question:", payload);

          // Panggil API Create
          const response = await axios.post(
            API_LINK + "Question/SaveDataQuestion",
            payload
          );
          const newQuestionId = response.data?.[0]?.hasil;

          if (!newQuestionId) throw new Error("Failed to save question.");
          question.key = newQuestionId; // Simpan ID setelah create
        } else {
          // Parameter untuk UPDATE
          payload = {
            p1: question.key, // ID Question (que_id)
            p2: formData.quizId, // ID Quiz
            p3: question.text, // Soal
            p4: question.type, // Tipe Soal
            p5: finalGambar || "", // Gambar
            p6: "Aktif", // Status
            p7: activeUser, // Modified By
            p8: question.point || 0, // Poin
          };

          console.log("Payload Update Question:", payload);

          // Panggil API Update
          await axios.post(API_LINK + "Question/UpdateDataQuestion", payload);
        }

        // Tangani opsi untuk Pilihan Ganda
        if (question.type === "Pilgan") {
          for (const [optionIndex, option] of question.options.entries()) {
            let optionPayload;

            if (!option.id) {
              // Parameter untuk CREATE opsi
              optionPayload = {
                p1: optionIndex + 1, // Urutan
                p2: option.label, // Isi Opsi
                p3: question.key, // ID Question
                p4: option.point || 0, // Nilai
                p5: activeUser, // Created By
                p6: question.jenis === "Tunggal" ? "Tunggal" : "Jamak", // Jenis Opsi
              };

              console.log("Payload Create Option:", optionPayload);

              // Panggil API Create Opsi
              const optionResponse = await axios.post(
                API_LINK + "Choice/SaveDataChoice",
                optionPayload
              );
              option.id = optionResponse.data?.[0]?.hasil;
            } else {
              // Parameter untuk UPDATE opsi
              optionPayload = {
                cho_id: option.id, // ID Opsi
                questionId: question.key, // ID Question
                urutanChoice: optionIndex + 1, // Urutan
                cho_isi: option.label, // Isi Opsi
                cho_nilai: option.point || 0, // Nilai
                quemodifby: activeUser, // Modified By
                cho_tipe: question.jenis === "Tunggal" ? "Tunggal" : "Jamak", // Jenis Opsi
              };

              console.log("Payload Update Option:", optionPayload);

              // Panggil API Update Opsi
              await axios.post(
                API_LINK + "Choice/UpdateDataChoice",
                optionPayload
              );
            }
          }
        }
      }

      // Reset deletedChoices setelah berhasil disimpan
      setDeletedChoices([]);

      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil disimpan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // window.reload.location();
      });
    } catch (error) {
      console.error("Error in handleAdd:", error);
      Swal.fire({
        title: "Gagal!",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const updatedFormContent = formContent.map((question) => {
      if (question.gambar) {
        return {
          ...question,
          previewUrl: `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
            question.gambar
          )}`,
        };
      }
      return question;
    });
    setFormContent(updatedFormContent);
  }, []);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx"; // Path to your template file in the public directory
    link.download = "template.xlsx";
    link.click();
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
    return parseInt(hours) * 3600 + parseInt(minutes) * 60;
  };

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  const handleHoursChange = (e) => {
    setHours(e.target.value);
  };

  const handleMinutesChange = (e) => {
    setMinutes(e.target.value);
  };

  const convertSecondsToTimeFormat = (seconds) => {
    const formatHours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const formatMinutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    setHours(formatHours);
    setMinutes(formatMinutes);
    return `${formatHours}:${formatMinutes}`;
  };

  const handlePageChange = (content) => {
    onChangePage(content);
  };

  const removeHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
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
            Edit Pre-Test
          </h4>
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
        <div className="card mt-3 mb-3" style={{ margin: "0 80px" }}>
          <div className="card-body p-4">
            {hasTest ? (
              <div>
                <div className="row mb-4">
                  <div className="col-lg">
                    <Input
                      type="text"
                      label="Deskripsi Quiz"
                      forInput="quizDeskripsi"
                      value={formData.quizDeskripsi}
                      onChange={handleInputChange}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label htmlFor="waktuInput" className="form-label">
                      <span style={{ fontWeight: "bold" }}>Durasi:</span>
                      <span style={{ color: "red" }}> *</span>
                    </label>

                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center me-3">
                        <select
                          className="form-select me-2"
                          name="hours"
                          value={hours}
                          onChange={handleHoursChange}
                        >
                          {[...Array(24)].map((_, i) => (
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
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
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
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
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex">
                        <div className="">
                          <Button
                            title="Tambah Pertanyaan"
                            onClick={() => addQuestion("Essay")}
                            iconName="plus"
                            label="Tambah Soal"
                            classType="primary btn-sm px-3 py-2"
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
                            classType="primary btn-sm mx-2 px-3 py-2"
                            onClick={() =>
                              document.getElementById("fileInput").click()
                            } // Memicu klik pada input file
                          />
                        </div>
                      </div>
                      {/* Tampilkan nama file yang dipilih */}
                      {selectedFile && <span>{selectedFile.name}</span>}
                      <div className="d-flex">
                        <div className="mr-4">
                          <Button
                            title="Unggah File Excel"
                            iconName="paper-plane"
                            classType="primary btn-sm px-3 py-2"
                            onClick={handleUploadFile}
                            label="Unggah File"
                          />
                        </div>

                        <Button
                          iconName="download"
                          label="Unduh Template"
                          classType="warning btn-sm px-3 py-2 mx-2"
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
                        {(question.type === "Essay" ||
                        question.type === "Praktikum"
                          ? parseInt(question.point)
                          : 0) +
                          (question.type === "Pilgan"
                            ? (question.options || []).reduce(
                                (acc, option) => acc + parseInt(option.point),
                                0
                              )
                            : 0)}
                      </span>{" "}
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
                      <div className="row">
                        <div className="col-lg-12 question-input">
                          <label
                            htmlFor="deskripsiMateri"
                            className="form-label fw-bold"
                          >
                            Pertanyaan <span style={{ color: "Red" }}> *</span>
                          </label>
                          <Editor
                            forInput={"pertanyaan_${index}"}
                            value={removeHtmlTags(question.text)}
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

                        {/* Tampilkan tombol gambar dan PDF hanya jika type = essay */}
                        {(question.type === "Essay" ||
                          question.type === "Praktikum") && (
                          <div className="col-lg-12 d-flex align-items-center form-check">
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

                              {question.gambar && !question.selectedFile && (
                                <div
                                  style={{
                                    maxWidth: "300px", // Set maximum width for the image container
                                    maxHeight: "300px", // Set maximum height for the image container
                                    overflow: "hidden", // Hide any overflow beyond the set dimensions
                                  }}
                                >
                                  <img
                                    src={question.gambar}
                                    alt=""
                                    style={{
                                      width: "100%", // Ensure image occupies full width of container
                                      height: "auto", // Maintain aspect ratio
                                      objectFit: "contain", // Fit image within container without distortion
                                    }}
                                  />
                                </div>
                              )}

                              <div className="mt-2">
                                <label className="form-label fw-bold">
                                  Point <span style={{ color: "Red" }}> *</span>
                                </label>{" "}
                                {/* Memberikan margin atas kecil untuk jarak yang rapi */}
                                <Input
                                  type="number"
                                  value={question.point}
                                  onChange={(e) => handlePointChange(e, index)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {question.type === "Pilgan" && (
                          <>
                            <div
                              className="col-lg-2 mb-3"
                              style={{ width: "250px" }}
                            >
                              <select
                                className="form-select"
                                aria-label="Default select example"
                                value={question.jenis}
                                onChange={(e) =>
                                  handleJenisTypeChange(e, index)
                                }
                              >
                                <option value="Tunggal">Pilihan Tunggal</option>
                                <option value="Jamak">Pilihan Jamak</option>
                              </select>
                            </div>
                            <div className="col-lg-12">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="form-check"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {/* Input Radio atau Checkbox */}
                                  <input
                                    type={
                                      question.jenis === "Tunggal"
                                        ? "radio"
                                        : "checkbox"
                                    }
                                    id={`option_${index}_${optionIndex}`}
                                    name={`option_${index}`} // Pastikan name sama untuk radio button
                                    value={option.value}
                                    checked={!!option.isChecked} // Atur apakah opsi ini dipilih
                                    onChange={(e) =>
                                      handleOptionChange(e, index, optionIndex)
                                    }
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
                                    className="rounded-3"
                                    readOnly={question.type === "answer"}
                                    style={{ marginRight: "10px" }}
                                  />

                                  {/* Tampilkan Label Baru */}
                                  {!option.id && (
                                    <span className="badge bg-warning">
                                      Baru
                                    </span>
                                  )}

                                  {/* Tombol Hapus Opsi */}
                                  <Button
                                    iconName="delete"
                                    classType="btn-sm ms-2 px-2 py-0"
                                    onClick={() =>
                                      handleDeleteOption(index, optionIndex)
                                    }
                                    style={{ marginRight: "10px", backgroundColor:"red", color:"white" }}
                                  />

                                  {/* Input Nilai untuk Pilihan */}
                                  {option.isChecked && (
                                    <input
                                      type="text"
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
                                </div>
                              ))}

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
                                style={{
                                  backgroundColor: "red",
                                  color: "white",
                                }}
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
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between">
                  <Button
                    classType="outline-secondary me-2 px-4 py-2"
                    label="Sebelumnya"
                    onClick={() =>
                      onChangePage(
                        "sharingEdit",
                        AppContext_test.ForumForm,
                        AppContext_master.MateriForm,
                        (AppContext_master.count += 1)
                      )
                    }
                  />
                  {hasTest ? (
                    <div className="d-flex">
                      <Button
                        classType="primary ms-2 px-4 py-2"
                        type="submit"
                        label="Edit"
                        onClick={handleAdd}
                      />
                      <Button
                        classType="primary ms-3 px-4 py-2"
                        label="Berikutnya"
                        onClick={() =>
                          onChangePage(
                            "posttestEdit",
                            AppContext_master.MateriForm,
                            (AppContext_master.count += 1),
                            AppContext_test.ForumForm
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div
                  className=""
                  style={{ marginLeft: "20px", marginRight: "20px" }}
                >
                  <Alert
                    type="warning"
                    message={
                      <span>
                        Pre-Test belum ditambahkan.{" "}
                        <a
                          onClick={() =>
                            onChangePage(
                              "pretestEditNot",
                              AppContext_master.MateriForm = AppContext_master.DetailMateriEdit
                            )
                          }
                          className="text-primary"
                        >
                          Tambah Data
                        </a>
                      </span>
                    }
                  />
                </div>
                <div className="d-flex justify-content-between ">
                  <div className="ml-4">
                    <Button
                      classType="outline-secondary me-2 px-4 py-2"
                      label="Sebelumnya"
                      onClick={() =>
                        onChangePage(
                          "sharingEdit",
                          AppContext_test.ForumForm,
                          AppContext_master.MateriForm = AppContext_master.DetailMateriEdit,
                          (AppContext_master.count += 1)
                        )
                      }
                    />
                  </div>
                  <div className="d-flex mr-4">
                    <Button
                      classType="primary ms-3 px-4 py-2"
                      label="Berikutnya"
                      onClick={() =>
                        onChangePage(
                          "posttestEdit",
                          AppContext_master.MateriForm = AppContext_master.DetailMateriEdit,
                          (AppContext_master.count += 1)
                        )
                      }
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
            pesan={
              isBackAction
                ? "Apakah anda ingin kembali?"
                : "Anda yakin ingin simpan data?"
            }
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}
      </form>
    </>
  );
}
