import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import UploadFile from "../../../util/UploadFile";
import Button from "../../../part/Button copy";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import FileUpload from "../../../part/FileUpload";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import KMS_Sidebar from "../../../part/KMS_SideBar";
import styled from "styled-components";
import KMS_Uploader from "../../../part/KMS_Uploader";
import axios from "axios";
import AppContext_test from "./TestContext";
import Cookies from "js-cookie";
import he from "he";
import { decryptId } from "../../../util/Encryptor";
import Search from "../../../part/Search";

const ButtonContainer = styled.div`
    bottom: 35px;
  display: flex;
  justify-content: space-between;
`;

export default function PengerjaanTest({
  onChangePage,
  quizType,
  materiId,
  quizId,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [showSidebar, setShowSidebar] = useState(true);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [questionNumbers, setQuestionNumbers] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState();
  const [answerStatus, setAnswerStatus] = useState([]);
  const [answerUser, setAnswerUser] = useState([]);
  const selectPreviousQuestion = () => {
    if (selectedQuestion > 1) {
      setSelectedQuestion(selectedQuestion - 1);
    } else {
      setSelectedQuestion(selectedQuestion + totalQuestion - 1);
    }
  };

  const idTrq = quizId;

  console.log("idd", quizId)

  AppContext_test.quizType = quizType;
  console.log("tipe", AppContext_test.quizType);
  const selectNextQuestion = () => {
    if (selectedQuestion < totalQuestion) {
      setSelectedQuestion(selectedQuestion + 1);
    } else {
      setSelectedQuestion(selectedQuestion - totalQuestion + 1);
    }
  };
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const FileCard = ({ fileName }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffe0e0",
          borderRadius: "10px",
          padding: "10px",
        }}
      >
        <img src="/path/to/file-icon.png" style={{ marginRight: "10px" }} />
        <span style={{ fontSize: "14px" }}>{fileName}</span>
      </div>
    );
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--responsiveContainer-margin-left",
      "0vw"
    );
    const sidebarMenuElement = document.querySelector(".sidebarMenu");
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add("sidebarMenu-hidden");
    }
  }, []);

  const getSubmittedAnswer = (itemId) => {
    console.log("iteemmm", answerUser)
    for (let i = 0; i < answerUser.length; i++) {
      if (answerUser[i].que_id === itemId) {
        console.log("jawabann", answerUser[i].ans_jawaban_pengguna);
        return answerUser[i] ? answerUser[i].ans_jawaban_pengguna : "";
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch questions data
        const questionResponse = await axios.post(
          API_LINK + "Quiz/GetDataQuestion",
          {
            idQuiz: AppContext_test.IdQuiz,
          }
        );
        console.log("response", questionResponse.data);
        // Fetch user answers data
        const answerResponse = await axios.post(
          API_LINK + "Quiz/GetDataAnswer",
          {
            IdTrq: idTrq,
          }
        );
        console.log("id trq", quizId)
        console.log("id quiz",AppContext_test.IdQuiz)
        console.log("question", questionResponse.data)
        console.log("answer", answerResponse.data);
        console.log(
          "ddd",
          materiId,
          activeUser,
          AppContext_test.quizType,
          quizId
        );

        const penggunaJawaban = answerResponse.data.map(item => ({
          ans_id: item.ans_id,
          que_id: item.que_id,
          que_soal: item.que_soal,
          ans_jawaban_pengguna: item.ans_jawaban_pengguna,
          ans_nilai: item.ans_nilai,
          ans_urutan: item.ans_urutan,
          ans_tipe : item.que_tipe
        }));

        // const jawabanPenggunaStr = answerResponse.data[0].JawabanPengguna;

        // const jawabanPengguna = jawabanPenggunaStr
        //     .slice(1, -1)
        //     .split('], [')
        //     .map(item => item.replace(/[\[\]]/g, '').split(','));
        // const filteredTransaksi = jawabanPengguna.filter(transaksi =>
        //       transaksi.length === 2
        //     );

        // const essayOnly = jawabanPengguna.filter(transaksi =>
        //       transaksi.length === 3
        //     );

        // const currentRespondent = currentData[currentRespondentIndex];
        // const jawabanPenggunaEssayStr = answerResponse.data[0].JawabanPengguna;

        // const jawabanPenggunaEssay = jawabanPenggunaEssayStr
        //     .slice(1, -1)
        //     .split('], [')
        //     .map(item => item.replace(/[\[\]]/g, '').split(','));

        // const processedJawaban = jawabanPengguna.map((item) => {
        //   if (item[0] === "essay") {
        //     return [item[0], item[1], item.slice(2).join(" ")];
        //   }
        //   return item;
        // });

        // const validJawabanPengguna = processedJawaban.filter(
        //   (item) => item.length === 3
        // );

        // // Map the filtered array to the desired format
        // const formattedAnswers = validJawabanPengguna.map((item) => ({
        //   idSoal: item[1],
        //   namaFile: item[2],
        // }));

        // setAnswerUser(formattedAnswers);
        console.log("jawaban penggggunaa",penggunaJawaban)
        setAnswerUser(penggunaJawaban);

        if (
          questionResponse.data &&
          Array.isArray(questionResponse.data)
          // filteredTransaksi &&
          // Array.isArray(filteredTransaksi)
        ) {
          const questionMap = new Map();
          // let resultJawabanPengguna = [];

          // answerResponse.data.map((answer) => {
          //   resultJawabanPengguna = answer.JawabanPengguna;
          // });

          // // const parsedArray = JSON.parse(resultJawabanPengguna);

          // const jawabanPengguna = {
          //   value: [],
          //   soal: [],
          //   file: [],
          // };

          // Melakukan iterasi pada array dan memisahkan nilai dan soal
          // for (let i = 0; i < filteredTransaksi.length; i++) {
          //   const value = filteredTransaksi[i][0]
          //     ? filteredTransaksi[i][0].trim()
          //     : "0";
          //   const soal = filteredTransaksi[i][1]
          //     ? filteredTransaksi[i][1].trim()
          //     : "0";
          //   const file = filteredTransaksi[i][2]
          //     ? filteredTransaksi[i][2].trim()
          //     : "0";

          //   jawabanPengguna.value.push(parseInt(value, 10));
          //   jawabanPengguna.soal.push(parseInt(soal, 10));
          //   jawabanPengguna.file.push(parseInt(file, 10));
          // }

          const transformedData = questionResponse.data
            .map((item) => {
              const {
                Soal,
                TipeSoal,
                Jawaban,
                UrutanJawaban,
                NilaiJawaban,
                NilaiJawabanOpsi,
                ForeignKey,
                Key,
                JawabanPengguna,
                TipePilihan,
                Gambar
              } = item;
              if (!questionMap.has(Soal)) {
                questionMap.set(Soal, true);
                if (TipeSoal === "Essay") {
                  return {
                    type: "Essay",
                    question: Soal,
                    correctAnswer: Jawaban,
                    answerStatus: "none",
                    point: NilaiJawaban,
                    id: Key,
                    jawabanPengguna_soal: penggunaJawaban.find(
                      (jawaban) => jawaban.que_soal === Soal && jawaban.que_id === Key),
                    gambar: Gambar,
                  };
                } else if (TipeSoal === "Praktikum") {
                  return {
                    type: "Praktikum",
                    question: Soal,
                    correctAnswer: Jawaban,
                    answerStatus: "none",
                    point: NilaiJawaban,
                    id: Key,
                    jawabanPengguna_soal: penggunaJawaban.find(
                      (jawaban) => jawaban.que_soal === Soal && jawaban.que_id === Key),
                      gambar : Gambar,
                  };
                } else {
                  const options = questionResponse.data
                    .filter((choice) => choice.Key === item.Key)
                    .map((choice) => ({
                      value: choice.Jawaban,
                      urutan: choice.UrutanJawaban,
                      nomorSoal: choice.Key,
                      nilai: choice.NilaiJawabanOpsi,
                      id: Key,
                      opsi: TipePilihan
                    }));
                    console.log("optionnnnn", options);
                  return {
                    type: "pilgan",
                    question: Soal,
                    options: options,
                    correctAnswer: options.find(
                      (option) =>
                        option.value === Jawaban && 
                      option.nilai !== "0"
                    ),
                    urutan: UrutanJawaban,
                    nilaiJawaban: NilaiJawabanOpsi,
                    jawabanPengguna_value: penggunaJawaban
                      .filter((jawaban) => jawaban.que_soal === Soal && jawaban.que_id === Key)
                      .map((jawaban) => jawaban.value), // Mengambil nilai dari semua jawaban pengguna
                    jawabanPengguna_soal: penggunaJawaban.filter(
                      (jawaban) => jawaban.que_soal === Soal && jawaban.que_id === Key
                    ),
                    id: Key,
                  };
                }
              }
              return null;
            })
            .filter((item) => item !== null);
          setTotalQuestion(transformedData.length);
          setQuestionNumbers(transformedData.length);
          console.log("data question", transformedData);
          console.log("jawaban pengguna soal", transformedData[0].jawabanPengguna_soal.ans_jawaban_pengguna);
          setCurrentData(transformedData);
          updateAnswerStatus(transformedData, penggunaJawaban);
        } else {
          throw new Error("Data format is incorrect");
        }
      } catch (error) {
        setIsError(true);
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateAnswerStatus = (questions, jawabanPengguna) => {
    const statusArray = questions.map((question, index) => {
      if (question.type === "essay") {
        return "none";
      } else {
        const userAnswerIndex = jawabanPengguna.que_soal.indexOf(index + 1);
        const userAnswer = jawabanPengguna.ans_jawaban_pengguna[userAnswerIndex];
        const correctOption = question.options.find(
          (option) => option.nilai != 0
        );

        if (userAnswer === correctOption.urutan) {
          return "correct";
        } else {
          return "incorrect";
        }
      }
    });
    setAnswerStatus(statusArray);
  };

  const downloadFile = async (namaFile) => {
    try {
      console.log("Nama file:", namaFile);
      const response = await axios.get(
        `${API_LINK}Upload/GetFile/${encodeURIComponent(namaFile)}`,
        {
          responseType: "arraybuffer", // Untuk menangani file biner
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };


  const processOptions = (nomorSoal, jawabanPengguna_soal) => {
    let i = 0;
    for (i = 0; i <= jawabanPengguna_soal.length; i++) {
      if (nomorSoal == jawabanPengguna_soal[i]) {
        break;
      }
    }
    console.log("dataaa saata inin", currentData);
    return i;
    
  };

  const removeHtmlTags = (str) => {
    const decoded = he.decode(str); // Decode HTML entities seperti &lt; menjadi <
    return decoded.replace(/<\/?[^>]+(>|$)/g, ''); // Hapus semua tag HTML
};
  AppContext_test.durasiTest = 10000;
  
  return (
    <>
     <Search
            title="Hasil Kuis Materi"
            description="Anda akan mendapatkan hasil kuis yang telah anda kerjakan selama anda mengerjakannya sesuai dengan jawaban yang benar atau salah."
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
      <div className="d-flex" style={{marginTop:"20px", height:"60vh"}}>
        <div
          className="flex-fill p-3 d-flex flex-column"
          style={{ marginLeft: "4vw" }}
        >
          <div className="mb-3 d-flex flex-wrap" style={{ overflowX: "auto" }}>
            {console.log("data bbek", currentData)}
            {currentData.map((item, index) => {
              // const matchedAnswer = formattedAnswers.find(answer => answer.idSoal === " " + item.Key);
              if (index + 1 !== selectedQuestion) return null;
              // const totalPoints =
              // item.type === "Pilgan" && item.jawabanPengguna_soal?.ans_nilai
              //   ? parseFloat(item.jawabanPengguna_soal.ans_nilai) || 0
              //   : item.type === "Essay" || item.type === "Praktikum"
              //   ? parseFloat(item.point || 0)
              //   : 0;
              const totalPoints = Array.isArray(item.jawabanPengguna_soal)
              ? item.jawabanPengguna_soal.reduce((sum, answer) => sum + (parseFloat(answer.ans_nilai) || 0), 0)
              : parseFloat(item.jawabanPengguna_soal?.ans_nilai || 0);
                // console.log("total", totalPoints)
              return (
                <div
                  key={index}
                  className="mb-3"
                  style={{
                    display: "block",
                    verticalAlign: "top",
                    minWidth: "300px",
                    marginRight: "20px",
                  }}
                >
                  {/* Soal */}
                  <div className="mb-3">
                    <h4
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        textAlign: "justify",
                      }}
                    >
                      <div className="">   
                        
                        <div className="">
                          {removeHtmlTags(he.decode(item.question))}   
                          {totalPoints > 0 ? (
                <span
                  style={{
                    fontSize: "16px",
                    color: "green",
                    marginLeft: "8px",
                  }}
                >
                  {totalPoints} Point
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "16px",
                    color: "red",
                    marginLeft: "8px",
                  }}
                >
                  Salah
                </span>
              )}


                      {/* {item.que_tipe === "Pilgan"
                        ? (() => {
                            const totalPoints = item.jawabanPengguna_soal
                              .filter((jawaban) => jawaban.que_id === item.que_id)
                              .reduce((total, jawaban) => total + (jawaban.ans_nilai || 0), 0);
                            return totalPoints === 0 ? (
                              <span
                                style={{
                                  fontSize: "16px",
                                  color: "red",
                                  marginLeft: "8px",
                                }}
                              >
                                Salah
                              </span>
                            ) : null;
                          })()
                        : (() => {
                            const points = item.jawabanPengguna_soal?.ans_nilai || '';
                            return points === 0 ? (
                              <span
                                style={{
                                  fontSize: "16px",
                                  color: "red",
                                  marginLeft: "8px",
                                }}
                              >
                                Salah
                              </span>
                            ) : null;
                          })()} */}
                        </div>
                    
                      </div>
                    </h4>
                  </div>
                  {(item.type === "Essay" || item.type === "Praktikum") &&
                      item.gambar && (
                        <div>
                          <img
                            id="image"
                            src={API_LINK + `Upload/GetFile/${item.gambar}`}
                            alt="gambar"
                            className="img-fluid"
                            style={{
                              maxWidth: "500px",
                              maxHeight: "500px",
                              overflow: "hidden",
                              borderRadius: "20px",
                            }}
                          />
                        </div>
                      )}

                  {item.type === "Praktikum" ? (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        downloadFile(
                          getSubmittedAnswer(item.id)
                            ? getSubmittedAnswer(item.id)
                            : "Tidak ada file"
                        )
                      }
                      style={{marginTop:"25px"}}
                    >
                      <i className="fi fi-rr-file-download me-2"></i>
                      {getSubmittedAnswer(item.id)
                        ? getSubmittedAnswer(item.id)
                        : "Tidak ada jawaban"}
                    </button>
                  ) : item.type === "Essay" ? (
                    <Input
                      name="essay_answer"
                      type="textarea"
                      label="Jawaban Anda:"
                      value={getSubmittedAnswer(item.id)}
                      onChange={(event) =>
                        handleTextareaChange(event, index + 1, item.id)
                      }
                      disabled={true}
                    />
                  ) : (
                    <div className="d-flex flex-column">
                      {console.log("data item", item)}
                    {item.options.map((option, optionIndex) => {
                      if(option.opsi === "Tunggal"){
                        const isSelected = item.jawabanPengguna_soal.some(
                          (jawaban) => jawaban.ans_urutan === option.urutan
                        );
                        const isCorrect = option.nilai !== 0;
                        
                        let borderColor1 = "lightgray";
                        let backgroundColor1 = "white";
                        
                        if (isSelected) {
                          borderColor1 = isCorrect ? "#28a745" : "#dc3545"; // Hijau untuk benar, merah untuk salah
                          backgroundColor1 = isCorrect ? "#e9f7eb" : "#f8d7da"; // Warna background dinamis
                        }

                    return (
                      <div
                        key={optionIndex}
                        className="mt-4 mb-2"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <button
                          className="btn btn-outline-primary"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderColor: borderColor1,
                            backgroundColor: backgroundColor1,
                            color: borderColor1,
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </button>
                        <span className="ms-2">{option.value}</span>
                      </div>
                    );
                  } else {
                    const isSelected = item.jawabanPengguna_soal.some(
                      (jawaban) => jawaban.ans_urutan === option.urutan
                    );
                    const isCorrect = option.nilai !== 0;
                    
                    let borderColor1 = "lightgray";
                    let backgroundColor1 = "white";
                    
                    if (isSelected) {
                      borderColor1 = isCorrect ? "#28a745" : "#dc3545"; // Hijau untuk benar, merah untuk salah
                      backgroundColor1 = isCorrect ? "#e9f7eb" : "#f8d7da"; // Warna background dinamis
                    }
                    
                    return (
                      <div
                        key={optionIndex}
                        className="mt-4 mb-2"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                           // Disable untuk memastikan tidak bisa diubah oleh user
                          style={{
                            marginLeft: "6px",
                            marginRight: "10px",
                            transform: "scale(1.5)",
                            borderColor: borderColor1,
                            backgroundColor: backgroundColor1, // Warna background checkbox dinamis
                            width: "20px", // Ukuran checkbox
                            height: "20px", // Ukuran checkbox
                            accentColor: isCorrect ? "#28a745" : "#dc3545", // Warna check saat dipilih
                          }}
                        />
                        <span className="ms-2">{option.value}</span>
                      </div>
                    );
                  }
                  })}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form>
            <div className=" my-4 mx-1 ">
              <ButtonContainer>
                <Button
                  classType="secondary me-2 px-4 py-2"
                  label="Sebelumnya"
                  onClick={selectPreviousQuestion}
                />
                <Button
                  classType="primary ms-2 px-4 py-2"
                  label="Selanjutnya"
                  onClick={selectNextQuestion}
                />
              </ButtonContainer>
            </div>
          </form>
        </div>
        <>
   
        <div style={{ height: '100%', width: '1px', backgroundColor: '#E4E4E4', margin: '0 auto' }} ></div>
   
        </>
        
        <KMS_Sidebar
          onChangePage={onChangePage}
          questionNumbers={questionNumbers}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          answerStatus={answerStatus}
          checkMainContent="detail_test"
          quizId={AppContext_test.reviewQuizId}
          quizType={quizType}
        />
      </div>
    </>
  );
}
