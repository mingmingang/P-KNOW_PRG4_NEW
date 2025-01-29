import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../../util/Constants";
import axios from 'axios';
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import AppContext_test from "./TestContext";
import UseFetch from "../../../util/UseFetch";
import ReactPlayer from 'react-player';
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";

export default function MasterTestSharingVideo({ onChangePage, CheckDataReady, materiId }) {
    let activeUser = "";
    const cookie = Cookies.get("activeUser");
    if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentData, setCurrentData] = useState();
    const [sectionData, setSectionData] = useState([]);
    const [marginRight, setMarginRight] = useState("5vh");
    const [fileExtension, setFileExtension] = useState("");

    AppContext_test.refreshPage = "sharingVideo";

    const [fileData, setFileData] = useState({
        file: "",
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
        const sidebarMenuElement = document.querySelector('.sidebarMenu');
        if (sidebarMenuElement) {
            sidebarMenuElement.classList.add('sidebarMenu-hidden');
        }
    }, []);

    useEffect(() => {
        updateProgres();
      }, []);

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
                tipe: 'Sharing Expert'
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

    const getListSection = async (retries = 10, delay = 2000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.post(API_LINK + "Section/GetDataSectionByMateri", {
                    mat_id: AppContext_test.materiId,
                    sec_type: "Sharing Expert",
                    sec_status: "Aktif"
                });
                if (response.data.length !== 0) {
                    console.log("data sec", response.data);
                    return response.data;
                }
            } catch (error) {
                console.error("Error fetching materi data: ", error);
                if (i < retries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay))
                } else {
                    throw error;
                }
            }
        }
    };

    useEffect(() => {
        const fetchSectionData = async () => {
            try {
                const sections = await getListSection();
                if (sections && sections.length > 0) {
                    // Ambil file dari data pertama, sesuaikan key berdasarkan struktur response.data
                    const fileFromResponse = sections[0]?.ExpertVideo || "";
                    setCurrentData(sections[0]);
                    setFileData({ file: fileFromResponse });
                    setFileExtension(fileFromResponse.split('.').pop().toLowerCase());
                    console.log("File URL:", fileFromResponse);
                } else {
                    console.error("No sections found.");
                }
            } catch (error) {
                console.error("Error fetching section data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSectionData();
    }, [AppContext_test.materiId]);

    useEffect(() => {
        console.log("CurrentData telah diatur:", currentData);
    }, [currentData]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
      };

    return (
        <>
        <div className="d-flex" style={{minHeight:"100vh"}}>
        <KMS_Rightbar
     isActivePengenalan={false}
     isActiveForum={false}
     isActiveSharing={true}
     isActiveSharingPDF={false}
     isActiveSharingVideo={true}
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
            <div className="file-preview" style={{marginBottom:"20px", marginTop:"100px", color:"#002B6C" }}>
            <h1 className="ml-2" style={{fontWeight:"600", color: "#002B6C" }} >Sharing Expert Video</h1>
                    {currentData ? (
                        <p className="ml-2 mb-0">
                            Dibuat oleh {currentData.Nama} - {formatDate(currentData.CreatedDate)}
                        </p>
                    ) : (
                        <div className=""></div>
                    )}
                    {fileData.file ? (
                     <ReactPlayer
                     url={`${API_LINK}Upload/GetFile/${fileData.file}`}
                     playing={true}
                     controls={true}
                     width="1000px"
                     maxwidth="1000px"
                     height="90%"
                     style={{
                       borderRadius: "80px",
                        marginLeft:"10px"
                     }}
                   />
                    ) : (
                        <div className="alert alert-warning mt-4 mb-4 ml-4" >
                        Tidak ada Sharing Expert Video yang tersedia.
                      </div>
                    )}

            </div>
            </div>
        </>
    );

}