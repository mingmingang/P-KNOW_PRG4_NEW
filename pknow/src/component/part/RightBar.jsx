import React, { useState, useEffect, useContext } from "react";
import Button from "./Button copy";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../util/Constants";
import Icon from "./Icon";
import UseFetch from "../util/UseFetch";
import KMS_ProgressBar from "./ProgressBar";
import axios from "axios";
import Loading from "./Loading";
import Cookies from "js-cookie";
import AppContext_test from "../page/master-test/TestContext";
import { decryptId } from "../util/Encryptor";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import "../../App.css";
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function KMS_Rightbar({
  handlePreTestClick_close,
  handlePreTestClick_open,
  onChangePage,
  isOpen,
  materiId,
  refreshKey,
  setRefreshKey,
  isActivePengenalan = false,
  isActiveForum = false,
  isActiveSharing = false,
  isActiveSharingPDF = false,
  isActivePreTest = false,
  isActivePostTest = false,
  isActiveMateri = false,
  isActiveMateriPDF = false,
  isActiveMateriVideo = false,
  isActiveSharingVideo=false
}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  AppContext_test.activeUser = activeUser;

  const [dropdowns, setDropdowns] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [widthDynamic, setwidthDynamic] = useState("");
  const [showElement, setShowElement] = useState(false);
  const [showMainContent_SideBar, setShowMainContent_SideBar] =
    useState(isOpen);
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentDataMateri, setCurrentDataMateri] = useState([]);
  const [currentFilter, setCurrentFilter] = useState([]);
  const [idMateri, setIdMateri] = useState("");
  const [sections, setSections] = useState([]);
const [showMateriFile, setShowMateriFile] = useState(false);
const [showMateriVideo, setShowMateriVideo] = useState(false);
const [showSharingExpertFile, setShowSharingExpertFile] = useState(false);
const [showSharingExpertVideo, setShowSharingExpertVideo] = useState(false);

  useEffect(() => {}, [AppContext_test]);


  useEffect(() => {
    setShowMainContent_SideBar(isOpen);
  }, [isOpen]);
  
  const isDataReadyTemp = "";
  const materiIdTemp = "";
  const isOpenTemp = true;
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let materiData = null;
      let progresData = null;
      let maxRetries = 10;
      let retryCount = 0;
      if (materiId != null) {
        while ((!materiData || !progresData) && retryCount < maxRetries) {
          try {
            const [progresResponse] = await Promise.all([fetchProgresMateri()]);
            if (progresResponse) {
              progresData = progresResponse;
            }

            if (progresData) {
              setCurrentData(progresData);
            } else {
              console.error("Response data is undefined or null");
            }
          } catch (error) {
            setIsError(true);
            console.error("Fetch error:", error);
          }

          retryCount++;
          if (!progresData) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        setIsLoading(false);
      }
    };

    fetchData();
  }, [AppContext_test.materiId, AppContext_test.refreshPage]);
  //
 

  const fetchProgresMateri = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.post(
          API_LINK + "Materi/GetProgresMateri",
          {
            materiId: materiId,
            karyawanId: AppContext_test.activeUser,
          }
        );
        if (response.data) {
          success = true;
          return response.data;
        } else {
        }
      } catch (error) {
        console.error("Error fetching progres data:", error);
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchMateriData = async () => {
      try {
        // Fetch Materi data by ID
        const response = await axios.post(`${API_LINK}Materi/GetDataMateriById`, {
          materiId: materiId,
        });
        if (response.data) {
          // setCurrentDataMateri(response.data);

          // Check if PDF or Video exist in the response
          const { File_pdf, File_video } = response.data[0];
          setShowMateriFile(!!File_pdf); // Show Materi File if File_pdf exists
          setShowMateriVideo(!!File_video); // Show Materi Video if File_video exists
        }
      } catch (error) {
        console.error("Error fetching Materi data:", error);
      }
    };

    if (materiId) fetchMateriData();
  }, [materiId]);
  
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_LINK}Section/GetDataSection`, {
          p1: materiId,
          p2: "Aktif",
        });
        if (response.data) {
          setSections(response.data);
          // cek munculin button berdasarkan sec_type
          const secTypes = response.data.map(section => section.SectionType);
          setShowPreTest(secTypes.includes("Pre-Test"));
          setShowSharing(secTypes.includes("Sharing Expert"));
          setShowPostTest(secTypes.includes("Post-Test"));
          // cek untuk sharing expert file dan video
          const hasExpertFile = response.data.some(section => section.ExpertFile);
          const hasExpertVideo = response.data.some(section => section.ExpertVideo);
          setShowSharingExpertFile(hasExpertFile);
          setShowSharingExpertVideo(hasExpertVideo);
        }
      } catch (err) {
        console.error("Error fetching sections:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (materiId) fetchSections();
  }, [materiId]);

  const toggleDropdown = (name) => {
    setDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const listOfLearningStyle = {
    paddingLeft: "20px",
    paddingRight: "20px",
    display: "flex",
    alignItems: "center",
    paddingBottom: "5%",
  };

  const button_listOfLearningStyle = {
    backgroundColor: "white",
    color: "",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "40px",
    border:"1px solid #0A5EA8",
  };

  const progressStyle = {
    paddingTop: "5%",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingBottom: "5%",
  };

  const contentSidebarStyle = {
    paddingTop: "7%",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingBottom: "7%",
    maxHeight: "calc(100vh - 350px)",
    overflowY: "auto",
  };

  const styles = {
    sidebarItem: {
      fontFamily: "Arial, sans-serif",
      paddingBottom: "7%",
      paddingTop: "7%",
      width: "100%",
    },
    buttonDropdown: {
      cursor: "pointer",
    },
    dropdownContent: {
      borderTop: "none",
      backgroundColor: "white",
      paddingLeft: "25px",
      paddingTop: "15px",
    },
    item: {
      display: "flex",
      alignItems: "center",
      margin: "5px 0",
      padding: "10px",
    },
    radio: {
      marginRight: "10px",
    },
    link: {
      fontSize: "14px",
      color: "black",
      textDecoration: "none",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      width: "100%",
      textAlign: "left",
    },
  };

  const handleItemClick = (page, url, updateProgres) => {
    setRefreshKey((prevKey) => prevKey + 1);
    onChangePage(page);
    AppContext_test.urlMateri = url;
    AppContext_test.refreshPage = page;
    AppContext_test.progresMateri = updateProgres;
  };
  useEffect(() => {}, [refreshKey]);
  const [dropdownData, setDropdownData] = useState([]);
  const [showPengenalan, setShowPengenalan] = useState(false);
  const [showPreTest, setShowPreTest] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showPostTest, setShowPostTest] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [filePdf, setFilePdf] = useState(null);
  const [fileVideo, setFileVideo] = useState(null);

  useEffect(() => {
    if (currentDataMateri[0]?.File_video != "") {
    }
    if (currentDataMateri && currentDataMateri.length > 0) {
      const updatedDropdownData = [
        ...(currentDataMateri[0]?.File_pdf != null ||
        currentDataMateri[0]?.File_pdf != "" ||
        currentDataMateri[0]?.File_video != null ||
        currentDataMateri[0]?.File_video != ""
          ? [
              {
                name: "Materi",
                items: [
                  ...(currentDataMateri[0]?.File_pdf != ""
                    ? [
                        {
                          label: "Materi PDF",
                          onClick: () =>
                            handleItemClick(
                              "materipdf",
                              currentDataMateri[0]?.File_pdf,
                              "materi_pdf"
                            ),
                        },
                      ]
                    : []),
                  ...(currentDataMateri[0]?.File_video != ""
                    ? [
                        {
                          label: "Materi Video",
                          onClick: () =>
                            handleItemClick(
                              "materivideo",
                              currentDataMateri[0]?.File_video,
                              "materi_video"
                            ),
                        },
                      ]
                    : []),
                ],
                countDone: 5,
              },
            ]
          : []),
        ...(currentDataMateri[0]?.Sharing_pdf != null ||
        currentDataMateri[0]?.Sharing_video != null
          ? [
              {
                name: "Sharing Expert",
                items: [
                  ...(currentDataMateri[0]?.Sharing_pdf != null
                    ? [
                        {
                          label: "Sharing Expert PDF",
                          onClick: () =>
                            handleItemClick(
                              "materipdf",
                              currentDataMateri[0]?.Sharing_pdf,
                              "sharing_pdf"
                            ),
                        },
                      ]
                    : []),
                  ...(currentDataMateri[0]?.Sharing_video != null
                    ? [
                        {
                          label: "Sharing Expert Video",
                          onClick: () =>
                            handleItemClick(
                              "materivideo",
                              currentDataMateri[0]?.Sharing_video,
                              "sharing_video"
                            ),
                        },
                      ]
                    : []),
                ],
                countDone: 2,
              },
            ]
          : []),
      ];
      setDropdownData(updatedDropdownData);
      setShowPengenalan(currentDataMateri[0]?.Pengenalan != null);
      setShowPreTest(currentDataMateri[0]?.PreTest != null);
      setShowForum(currentDataMateri[0]?.Forum != null);
      setShowPostTest(currentDataMateri[0]?.PostTest != null);
    }
  }, [currentDataMateri]);

  function handleOpenClick() {
    setShowElement(false);
    setShowMainContent_SideBar(true);
    setwidthDynamic("");
  }

  function handleCloseClick() {
    setShowMainContent_SideBar(false);
    setShowElement(true);
    setwidthDynamic("4%");
  }

  function handleCombinedClick_open() {
    handleOpenClick();
    handlePreTestClick_open();
  }

  function handleCombinedClick_close() {
    handleCloseClick();
    handlePreTestClick_close();
  }

  function onClick_exit() {
    onChangePage("index");
    AppContext_test.refreshPage += 1;
  }

  function onClick_Pretest() {
    onChangePage("pretest");
    AppContext_test.refreshPage += 1;
  }

  function onClick_Posttest() {
    onChangePage("posttest");
    AppContext_test.refreshPage += 1;
  }

  function onClick_Forum() {
    onChangePage("forum");
    AppContext_test.refreshPage += 1;
  }

  function onClick_Pengenalan() {
    onChangePage("pengenalan");
    AppContext_test.refreshPage += 1;
  }

  function onClick_materiPDF() {
    onChangePage("materipdf", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "materipdf";
  }

  function onClick_materiVideo() {
    onChangePage("materivideo", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "materivideo";
  }

  function onClick_sharingPDF() {
    onChangePage("sharingPDF", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "sharingPDF";
  }

  function onClick_sharingVideo() {
    onChangePage("sharingVideo", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "sharingVideo";
  }

  function onClick_postTest() {
    onChangePage("posttest", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "posttest";
  }

  function onClick_preTest() {
    onChangePage("pretest", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "pretest";
  }
  function onClick_pengenalan() {
    onChangePage("pengenalan", isDataReadyTemp, materiIdTemp, isOpenTemp);
    AppContext_test.refreshPage = "pengenalan";
  }

  const [isHovered, setIsHovered] = useState(false);
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const [showMateriOptions, setShowMateriOptions] = useState(false);
  const onClick_close = () => {
    // Mengubah state untuk menampilkan tombol PDF dan Video
    setShowSharingOptions((prevState) => !prevState);
  };

  const onClick_closeMateri = () => {
    // Mengubah state untuk menampilkan tombol PDF dan Video
    setShowMateriOptions((prevState) => !prevState);
  };



  return (
    <div
      className="pt-2 overflow-y-auto"
      style={{ right: "2px", width: "350px" }}
    >
      <div className="px-2 collapseTrue">
        {showElement && (
          <div className="" style={{ marginTop: "100px" }}>
            <div className="" style={button_listOfLearningStyle}>
              <Icon
                name="angle-right"
                type="Bold"
                cssClass="btn text-light ms-0"
                onClick={handleCombinedClick_open}
              />
            </div>
          </div>
        )}
      </div>

      {showMainContent_SideBar && (
        <div className="collapseFalse" style={{ marginTop: "100px" }}>
          <div style={listOfLearningStyle}>
            <div style={button_listOfLearningStyle} >
              <Icon
                name="angle-left"
                type="Bold"
                cssClass="btn text-primary mt-1 mr-1"
                // onClick={handleCombinedClick_close}
                onClick={onClick_exit}
              />
            </div>
            <span
              style={{ fontWeight: "600", color: "#002B6C", fontSize: "20px", marginLeft:"-20px" }}
            >
              Daftar Pembelajaran
            </span>
          </div>
          <div className="">
            <div className="ml-3 mr-3 mb-3">
            <h5 style={{fontSize:"15px"}}>Progres</h5>
            <div className="" >
              {currentData.map((item) => (
                <div key={item.Key} className="d-flex">
                  <KMS_ProgressBar progress={item.TotalProgres ?? 0} />
                  <div className="d-flex mt-1">
                  <span style={{ fontSize: "14px", marginLeft: "8px" }}>
                    {item.TotalProgres ?? 0}
                  </span>
                  <span style={{fontSize: "12px"}}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr style={{margin:"10px 17px"}}/>
          </div>
          <>
            <div className="ml-3 mr-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActivePengenalan
                    ? "#0A5EA8"
                    : "transparent",
                  color: isActivePengenalan ? "white" : "black",
                }}
                onClick={onClick_Pengenalan} // Handler dari parent
              >
                Pengenalan Materi
              </button>
            </div>
            
            {showPreTest && (
            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActivePreTest ? "#0A5EA8" : "transparent",
                  color: isActivePreTest ? "white" : "black",
                }}
                onClick={onClick_Pretest}
              >
                Pre-Test
              </button>
            </div>
          )}

            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActiveMateri ? "#0A5EA8" : "transparent",
                  color: isActiveMateri ? "white" : "black",
                }}
                onClick={onClick_closeMateri}
              >
                Materi <i className="fas fa-caret-down ml-2"></i>
              </button>
            </div>

            {showMateriOptions && (
              <>
                 {showMateriFile && (
        <div className="ml-3 mr-3 mt-3">
          <button
            className="buttonRightBar"
            style={{
              backgroundColor: isActiveMateriPDF ? "#0A5EA8" : "transparent",
              color: isActiveMateriPDF ? "white" : "black",
            }}
            onClick={onClick_materiPDF}
          >
            Materi File
          </button>
        </div>
      )}

      {showMateriVideo && (
        <div className="ml-3 mr-3 mt-3">
          <button
            className="buttonRightBar"
            style={{
              backgroundColor: isActiveMateriVideo ? "#0A5EA8" : "transparent",
              color: isActiveMateriVideo ? "white" : "black",
            }}
            onClick={onClick_materiVideo}
          >
            Materi Video
          </button>
        </div>
      )}
              </>
            )}

            {showSharing && (
            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActiveSharing ? "#0A5EA8" : "transparent",
                  color: isActiveSharing ? "white" : "black",
                }}
                onClick={onClick_close}
              >
                Sharing Expert <i className="fas fa-caret-down ml-2"></i>
              </button>
            </div>
          )}
          {showSharingOptions && (
  <>
    {showSharingExpertFile && (
      <div className="ml-3 mr-3 mt-3">
        <button
          className="buttonRightBar"
          style={{
            backgroundColor: isActiveSharingPDF ? "#0A5EA8" : "transparent",
            color: isActiveSharingPDF ? "white" : "black",
          }}
          onClick={onClick_sharingPDF}
        >
          Sharing Expert File
        </button>
      </div>
    )}
    {showSharingExpertVideo && (
      <div className="ml-3 mr-3 mt-3">
        <button
          className="buttonRightBar"
          style={{
            backgroundColor: isActiveSharingVideo ? "#0A5EA8" : "transparent",
            color: isActiveSharingVideo ? "white" : "black",
          }}
          onClick={onClick_sharingVideo}
        >
          Sharing Expert Video
        </button>
      </div>
    )}
  </>
)}
          {showPostTest && (
            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActivePostTest ? "#0A5EA8" : "transparent",
                  color: isActivePostTest ? "white" : "black",
                }}
                onClick={onClick_Posttest}
              >
                Post-Test
              </button>
            </div>
          )}

            <div className="ml-3 mr-3 mt-3">
              <button
                className="buttonRightBar"
                style={{
                  backgroundColor: isActiveForum ? "#0A5EA8" : "transparent",
                  color: isActiveForum ? "white" : "black",
                }}
                onClick={onClick_Forum}
              >
                Forum
              </button>
            </div>

            
          </>
        </div>
      )}
    </div>
  );
}