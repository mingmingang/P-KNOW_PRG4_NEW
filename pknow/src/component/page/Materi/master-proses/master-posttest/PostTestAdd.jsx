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
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import Konfirmasi from "../../../../part/Konfirmasi";
import BackPage from "../../../../../assets/backPage.png";
import CustomStepper from "../../../../part/Stepp";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";

export default function MasterPostTestAdd({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isBackAction, setIsBackAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timer, setTimer] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [resetStepper, setResetStepper] = useState(0);
  const [filePreviews, setFilePreviews] = useState({});

  const [dataSection, setDataSection] = useState({
    materiId: AppContext_master.dataIDMateri,
    secJudul: "Section Materi " + AppContext_master.dataIDMateri,
    createdby: activeUser,
    secType: "",
  });

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent[questionIndex].jenis = value;
      updatedFormContent[questionIndex].cho_tipe = value;
      updatedFormContent[questionIndex].options = [];

      setSelectedOptions((prevSelected) => {
        const updatedSelected = [...prevSelected];
        updatedSelected[questionIndex] = value === "Tunggal" ? "" : [];
        return updatedSelected;
      });

      return updatedFormContent;
    });
  };

  useEffect(() => {
    setResetStepper((prev) => !prev + 1);
  });

  useEffect(() => {
    if (typeof AppContext_master.dataIdSectionPostTest !== "undefined") {
      setFormContent(AppContext_master.dataPostTest);
      setFormData(AppContext_master.dataQuizPostTest);
      setTimer(
        AppContext_master.dataTimerPostTest
          ? convertSecondsToTimeFormat(AppContext_master.dataTimerPostTest)
          : ""
      );
    }
  }, [AppContext_master.dataPostTest]);

  const handlePointChange = (e, index) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[index].point = value;
    setFormContent(updatedFormContent);
    setFormChoice((prevFormChoice) => ({
      ...prevFormChoice,
      nilaiChoice: value,
    }));
  };

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

  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: null,
    status: "Aktif",
    quecreatedby: activeUser,
  });

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

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    if (updatedFormContent[index].type === "Pilgan") {
      updatedFormContent[index].options.push({
        label: "",
        value: "",
        point: 0,
      });
      setFormContent(updatedFormContent);
    }
  };

  const storedSteps = sessionStorage.getItem("steps");
  const steps = storedSteps ? JSON.parse(storedSteps) : initialSteps;
  const posttest = steps.findIndex((step) => step === "Post-Test");

  const isStartDateBeforeEndDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  };

  const fileGambarRef = useRef(null);

  const handleFileChangeGambar = (ref, index, extAllowed) => {
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

    if (error) {
      ref.current.value = "";
    } else {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => ({
            ...prev,
            [index]: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    formData.timer = convertTimeToSeconds(timer);

    if (formData.timer === 0) {
      Swal.fire({
        title: "Gagal!",
        text: "Durasi tidak boleh 0.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

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

    const totalQuestionPoint = formContent.reduce((total, question) => {
      if (question.type !== "Pilgan") {
        total += parseInt(question.point);
      }
      return total;
    }, 0);

    const totalOptionPoint = formContent.reduce((total, question) => {
      if (question.type === "Pilgan") {
        return (
          total +
          question.options.reduce(
            (optionTotal, option) => optionTotal + parseInt(option.point || 0),
            0
          )
        );
      }
      return total;
    }, 0);

    if (totalQuestionPoint + totalOptionPoint !== 100) {
      setResetStepper((prev) => !prev + 1);
      Swal.fire({
        title: "Gagal!",
        text: `Total skor harus berjumlah 100. Saat ini skor berjumlah: ${
          totalQuestionPoint + totalOptionPoint
        }`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (typeof AppContext_master.dataIdSectionPostTest === "undefined") {
      try {
        const sectionResponse = await axios.post(
          API_LINK + "Section/CreateSection",
          dataSection
        );
        const sectionData = sectionResponse.data;

        if (sectionData[0]?.hasil === "OK") {
          const sectionId = sectionData[0].newID;
          AppContext_master.dataIdSectionPostTest = sectionId;
          formData.timer = convertTimeToSeconds(timer);
          AppContext_master.dataTimerPostTest = formData.timer;

          const quizResponse = await axios.post(
            API_LINK + "Quiz/SaveDataQuiz",
            {
              materiId: AppContext_master.dataIDMateri,
              sec_id: sectionId,
              quizDeskripsi: formData.quizDeskripsi,
              quizTipe: "Posttest",
              tanggalAwal: "",
              tanggalAkhir: "",
              timer: formData.timer,
              status: "Aktif",
              createdby: activeUser,
              type: "Post-Test",
            }
          );

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
          formData.sec_id = quizResponse.data[0].hasil;
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
              formQuestion.gambar = "";
            }

            try {
              await Promise.all(uploadPromises);
              const questionResponse = await axios.post(
                API_LINK + "Question/SaveDataQuestion",
                formQuestion
              );
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
                  answerText: question.correctAnswer
                    ? question.correctAnswer
                    : "0",
                  questionId: questionId,
                  nilaiChoice: question.point,
                  quecreatedby: activeUser,
                };

                try {
                  const answerResponse = await axios.post(
                    API_LINK + "Choice/SaveDataChoice",
                    answerData
                  );
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
                for (const [
                  optionIndex,
                  option,
                ] of question.options.entries()) {
                  const answerData = {
                    urutanChoice: optionIndex + 1,
                    answerText: option.label,
                    questionId: questionId,
                    nilaiChoice: option.point || 0,
                    quecreatedby: activeUser,
                    cho_tipe:
                      question.jenis === "Tunggal" ? "Tunggal" : "Jamak",
                  };

                  try {
                    const answerResponse = await axios.post(
                      API_LINK + "Choice/SaveDataChoice",
                      answerData
                    );
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
            text: "Post Test berhasil ditambahkan",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            setFormContent([]);
            setSelectedOptions([]);
            setErrors({});
            setTimer("");
            setIsButtonDisabled(true);
            if (steps.length == 4) {
              window.location.reload();
            } else if (steps.length === 5 && posttest === 3) {
              onChangePage(
                steps[4],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataPretest,
                AppContext_master.dataQuizPretest,
                (AppContext_master.dataPostTest = formContent),
                (AppContext_master.dataQuizPostTest = formData),
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 5 && posttest === 4) {
              window.location.reload();
            } else if (steps.length === 6 && posttest === 3) {
              onChangePage(
                steps[4],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataPretest,
                AppContext_master.dataQuizPretest,
                (AppContext_master.dataPostTest = formContent),
                (AppContext_master.dataQuizPostTest = formData),
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 6 && posttest === 4) {
              onChangePage(
                steps[5],
                AppContext_master.MateriForm,
                (AppContext_master.count += 1),
                AppContext_master.dataIdSection,
                AppContext_master.dataSectionSharing,
                AppContext_master.dataIdSectionSharing,
                AppContext_master.dataIdSectionPretest,
                AppContext_master.dataPretest,
                AppContext_master.dataQuizPretest,
                (AppContext_master.dataPostTest = formContent),
                (AppContext_master.dataQuizPostTest = formData),
                AppContext_master.dataTimerQuizPreTest,
                AppContext_master.dataTimerPostTest
              );
            } else if (steps.length === 6 && posttest === 5) {
              window.location.reload();
            }
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
    } else {
      formData.timer = convertTimeToSeconds(timer);
      AppContext_master.dataTimerQuizPreTest = formData.timer;
      const quizPayload = {
        quizId: formData.sec_id,
        materiId: formData.materiId,
        quizJudul: "",
        quizDeskripsi: formData.quizDeskripsi,
        quizTipe: formData.quizTipe,
        tanggalAwal: formData.tanggalAwal,
        tanggalAkhir: formData.tanggalAkhir,
        timer: formData.timer,
        status: "Aktif",
        modifby: activeUser,
      };

      try {
        const quizResponse = await axios.post(
          API_LINK + "Quiz/UpdateDataQuiz",
          quizPayload
        );

        if (!quizResponse.data.length) {
          Swal.fire({
            title: "Error!",
            text: "Gagal menyimpan quiz.",
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }

        const quizId = quizPayload.quizId;

        const deleteQuestion = await axios.post(
          API_LINK + "Question/DeleteQuestionByIdQuiz",
          { p1: quizId }
        );

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
            formQuestion.gambar = "";
          }

          try {
            await Promise.all(uploadPromises);
            const questionResponse = await axios.post(
              API_LINK + "Question/SaveDataQuestion",
              formQuestion
            );

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
                answerText: question.correctAnswer
                  ? question.correctAnswer
                  : "0",
                questionId: questionId,
                nilaiChoice: question.point,
                quecreatedby: activeUser,
              };

              try {
                const answerResponse = await axios.post(
                  API_LINK + "Choice/SaveDataChoice",
                  answerData
                );
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
          text: "Post Test berhasil dimodifikasi",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          setFormContent([]);
          setSelectedOptions([]);
          setErrors({});
          setIsButtonDisabled(true);
          if (steps.length == 4) {
            window.location.reload();
          } else if (steps.length === 5 && posttest === 3) {
            onChangePage(
              steps[4],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              AppContext_master.dataPretest,
              AppContext_master.dataQuizPretest,
              (AppContext_master.dataPostTest = formContent),
              (AppContext_master.dataQuizPostTest = formData),
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 5 && posttest === 4) {
            window.location.reload();
          } else if (steps.length === 6 && posttest === 3) {
            onChangePage(
              steps[4],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              AppContext_master.dataPretest,
              AppContext_master.dataQuizPretest,
              (AppContext_master.dataPostTest = formContent),
              (AppContext_master.dataQuizPostTest = formData),
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 6 && posttest === 4) {
            onChangePage(
              steps[5],
              AppContext_master.MateriForm,
              (AppContext_master.count += 1),
              AppContext_master.dataIdSection,
              AppContext_master.dataSectionSharing,
              AppContext_master.dataIdSectionSharing,
              AppContext_master.dataIdSectionPretest,
              AppContext_master.dataIdSectionPostTest,
              AppContext_master.dataPretest,
              AppContext_master.dataQuizPretest,
              (AppContext_master.dataPostTest = formContent),
              (AppContext_master.dataQuizPostTest = formData),
              AppContext_master.dataTimerQuizPreTest,
              AppContext_master.dataTimerPostTest
            );
          } else if (steps.length === 6 && posttest === 5) {
            window.location.reload();
          }
        });
      } catch (error) {
        console.error("Gagal menyimpan data:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menyimpan data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleQuestionTextChange = (e, index) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[index].text = value;
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
    if (question.jenis === "Tunggal") {
      question.options.forEach((option, idx) => {
        option.isChecked = idx === optionIndex;
        option.point = idx === optionIndex ? option.point : 0;
      });
    } else if (question.jenis === "Jamak") {
      question.options[optionIndex].isChecked = checked;
      if (!checked) {
        question.options[optionIndex].point = 0;
      }
    }
    setFormContent(updatedFormContent);
  };

  const handleChangeQuestion = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    if (question.type === "Essay") {
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

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
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

  const parseExcelData = (data) => {
    const questions = data
      .map((row, index) => {
        if (index < 2) return null;

        const options = row[3] ? row[3].split(",") : [];
        const bobotPilgan = row[4] ? row[4].split(",").map(Number) : [];
        const jenis = row[2]?.toLowerCase();
        const totalNonZero = bobotPilgan.filter((bobot) => bobot !== 0).length;

        return {
          text: row[1],
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
              : null,
          options:
            jenis === "pilgan"
              ? options.map((option, idx) => ({
                  label: option.trim(),
                  point: bobotPilgan[idx] || 0,
                  isChecked: bobotPilgan[idx] > 0,
                }))
              : [],
          point:
            jenis === "essay" || jenis === "praktikum"
              ? parseInt(row[5] || 0, 10)
              : null,
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
        return response.data;
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
      if (!uploadResponse || !uploadResponse.Hasil) {
        throw new Error("Respon server tidak valid.");
      }

      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        selectedFile: file,
        gambar: uploadResponse.Hasil,
        previewUrl: URL.createObjectURL(file),
      };
      setFormContent(updatedFormContent);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
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
        icon: "error",
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

  const handleTimerChange = (e) => {
    const { value } = e.target;
    setTimer(value);
  };

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    if (updatedFormContent[questionIndex].options[optionIndex].isChecked) {
      updatedFormContent[questionIndex].options[optionIndex].point = parseInt(
        value,
        10
      );
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

  const [activeStep, setActiveStep] = useState(4);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handlePageChange = (content) => {
    onChangePage(content);
  };

  const initialSteps = ["Pengenalan", "Materi", "Forum"];
  const additionalSteps = ["Sharing Expert", "Pre-Test", "Post-Test"];

  const handleStepChanges = (index) => {
    //console.log("Step aktif:", index);
  };

  const handleStepAdded = (stepName) => {
    //console.log("Step ditambahkan:", stepName);
  };

  const handleStepRemoved = (stepName) => {
    //console.log("Step dihapus:", stepName);
  };

  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };

  const [stepCount, setStepCount] = useState(0);

  const handleStepCountChange = (count) => {
    setStepCount(count);
  };

  const [stepPage, setStepPage] = useState([]);
  const handleAllStepContents = (allSteps) => {
    setStepPage(allSteps);
  };

  const handleSebelumnya = () => {
    if (steps.length == 4) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && posttest == 4) {
      onChangePage(
        steps[3],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 5 && posttest == 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && posttest == 3) {
      onChangePage(
        "forumBefore",
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest
      );
    } else if (steps.length == 6 && posttest == 4) {
      onChangePage(
        steps[3],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    } else if (steps.length == 6 && posttest == 5) {
      onChangePage(
        steps[4],
        AppContext_master.Materi,
        AppContext_test.ForumForm,
        (AppContext_master.count += 1),
        AppContext_master.dataIdSectionSharing,
        AppContext_master.dataIdSectionPretest,
        AppContext_master.dataIdSectionPostTest,
        (AppContext_master.dataPostTest = formContent),
        (AppContext_master.dataQuizPostTest = formData),
        AppContext_master.dataPretest,
        AppContext_master.dataQuizPretest,
        AppContext_master.dataTimerQuizPreTest,
        AppContext_master.dataTimerPostTest
      );
    }
  };

  if (isLoading) return <Loading />;

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
            Tambah Post Test
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
          <div style={{ margin: "20px 100px" }}>
            <CustomStepper
              initialSteps={initialSteps}
              additionalSteps={additionalSteps}
              onChangeStep={posttest}
              onStepAdded={handleStepAdded}
              onStepRemoved={handleStepRemoved}
              onChangePage={handleStepChange}
              onStepCountChanged={handleStepCountChange}
              onAllStepContents={handleAllStepContents}
            />
          </div>
        </div>
        <div className="card mt-4 " style={{ margin: "100px" }}>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-lg-7">
                <Input
                  type="text"
                  label="Deskripsi Post Test"
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
                            setFormQuestion((prevFormQuestion) => ({
                              ...prevFormQuestion,
                              soal: content,
                            }));
                          }}
                          apiKey="81ujooza2p3616vb7rdvc0lxphx68fe82f2aqj6qkmbvn6l4"
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
                          {question.previewUrl && (
                            <div
                              style={{
                                maxWidth: "300px",
                                maxHeight: "300px",
                                overflow: "hidden",
                                borderRadius: "20px",
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
                            {" "}
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
                                <input
                                  type={
                                    question.jenis === "Tunggal"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  id={`option_${index}_${optionIndex}`}
                                  name={`option_${index}`}
                                  value={option.value}
                                  checked={!!option.isChecked}
                                  onChange={(e) =>
                                    handleOptionChange(e, index, optionIndex)
                                  }
                                  style={{ marginRight: "10px" }}
                                />
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
                onClick={handleSebelumnya}
              />
            </div>
            <div className="d-flex mr-4">
              <div className="mr-2">
                <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label={
                    (steps.length === 4 && posttest === 3) ||
                    (steps.length === 5 && posttest === 4) ||
                    (steps.length === 6 && posttest === 5)
                      ? "Simpan"
                      : "Berikutnya"
                  }
                  disabled={isButtonDisabled}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="total-score-container">
        Total Skor: {validateTotalPoints()}
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
    </>
  );
}
