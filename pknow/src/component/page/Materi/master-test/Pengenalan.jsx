import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import Table from "../../../part/Table";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import axios from "axios";
import AppContext_master from "../master-proses/MasterContext";
import AppContext_test from "./TestContext";
import maskotPknow from "../../../../assets/pknowmaskot.png";
import he from "he";
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";

export default function MasterTestIndex({
  onChangePage,
  CheckDataReady,
  materiId,
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  const [marginRight, setMarginRight] = useState("5vh");

  AppContext_test.refreshPage = "pengenalan";

  const decodeHTML = (input) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  };

  async function updateProgres() {
    let success = false;
    let retryCount = 0;
    let maxRetries = 10;

    while (!success && retryCount < maxRetries) {
      try {
        const response = await axios.post(
          API_LINK + "Materi/UpdatePoinProgresMateri",
          {
            materiId: AppContext_test.materiId,
            kry_user : activeUser,
            tipe: 'Pengenalan'
          }
        );
        if (response.status === 200) {
          success = true;
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        retryCount += 1;
        if (retryCount >= maxRetries) {
          console.error(
            "Max retries reached. Stopping attempts to save progress."
          );
        }
      }
    }
  }

  function handleStartPostTest() {
    onChangePage("pengerjaantest", "Posttest", materiId);
  }

  const [tableData, setTableData] = useState([]);

  function handleDetailAction(action, key) {
    if (action === "detail") {
      onChangePage("detailtest", "Posttest", AppContext_test.materiId, key);
      AppContext_test.QuizType = "Posttest";
    }
  }

  useEffect(() => {
    let isMounted = true;

    const fetchData_posttest = async (retries = 10, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        setIsLoading(true);
        try {
          const [dataQuiz] = await Promise.all([getMateri()]);
          if (isMounted) {
            setCurrentData(dataQuiz);
            setIsLoading(false);
          }
        } catch (error) {
          if (isMounted) {
            setIsError(true);
            console.error("Fetch error:", error);
            if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              return;
            }
          }
        }
      }
    };

    const getMateri = async (retries = 10, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(
            API_LINK + "Materi/GetDataMateriById",
            {
              materiId: AppContext_test.materiId,
            }
          );
          if (response.data.length !== 0) {
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching materi data:", error);
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error; // Throw error if max retries reached
          }
        }
      }
    };

    fetchData_posttest();

    return () => {
      isMounted = false;
    };
  }, [AppContext_test.materiId]);

  useEffect(() => {
    for(let i = 0; i <= 0 ; i++){
      updateProgres();  
    }
  }, []);

  const circleStyle = {
    width: "50px",
    height: "50px",
    backgroundColor: "lightgray",
    marginRight: "20px",
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  return (
    <>
      <div className="d-flex" style={{minHeight:"100vh"}}>
        <div className="">
          <KMS_Rightbar
            isActivePengenalan={true}
            isActiveForum={false}
            isActiveSharing={false}
            isActiveSharingPDF={false}
            isActiveSharingVideo={false}
            isActiveMateri={false}
            isActiveMateriPDF={false}
            isActiveMateriVideo={false}
            isActivePreTest={false}
            isActivePostTest={false}
            isOpen={true}
            onChangePage={onChangePage}
            materiId={AppContext_test.materiId}
            // refreshKey={refreshKey}
            // setRefreshKey={setRefreshKey}
          />
        </div>
        <div className="d-flex flex-column">
          {/* <KMS_Rightbar handleposttestClick_close={handleposttestClick_close} handleposttestClick_open={handleposttestClick_open}/> */}
          {isError && (
            <div className="flex-fill">
              <Alert
                type="warning"
                message="Terjadi kesalahan: Gagal mengambil data Test."
              />
            </div>
          )}
          <div className="mt-3">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div
                  style={{
                    marginRight: "40px",
                    marginTop: "100px",
                    marginLeft: "40px",
                    marginBottom: "40px",
                    height: "600px",
                  }}
                  className="overflow-y-auto"
                >
                  <div className="align-items-center mb-3">
                    <h1 style={{ color: "#002B6C" }} className="mb-0">
                      {" "}
                      {currentData[0].Judul}
                    </h1>
                    <br />
                    <h6 className="mb-0" style={{ color: "#002B6C" }}>
                      Oleh {currentData[0].Nama} -{" "}
                      {formatDate(currentData[0].Creadate)}
                    </h6>
                  </div>
                  <div className="text-justify" style={{ marginRight: "6%" }}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: he.decode(currentData[0].Pengenalan),
                      }}
                    />
                    <div></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
