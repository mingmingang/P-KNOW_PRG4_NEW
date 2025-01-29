import { useState } from "react";
import Cookies from "js-cookie";
import AppContext_test from "../master-test/TestContext";
import { decryptId } from "../../../util/Encryptor";
import MasterProsesIndex from "./Index";
//Pengenalan
import PengenalanAdd from "./master-materi/PengenalanAdd";
import PengenalanEdit from "./master-materi/PengenalanEdit";
import PengenalanBefore from "./master-materi/PengenalanBefore";
// PreTest
import MasterPreTestAdd from "./master-pretest/PreTestAdd";
// import MasterPreTestAddNot from "./master-pretest/PreTestAddNot";
import MasterPreTestEdit from "./master-pretest/PreTestEdit";
import MasterPreTestEditNot from "./master-pretest/PreTestEditNot";
import MasterPreTestDetail from "./master-pretest/PreTestDetail";
// // Materi
import MasterMateriAdd from "./master-materi/MateriAdd";
import MasterMateriEdit from "./master-materi/MateriEdit";
// import MasterMateriDetail from "./master-materi/MateriDetail";
import MasterMateriReviewJawaban from "./master-materi/MateriReviewJawaban";
// // Sharing Expert
import MasterSharingAdd from "./master-sharing/SharingAdd";
// import MasterSharingDetailNot from "./master-sharing/SharingDetailNot";
import MasterSharingEditNot from "./master-sharing/SharingEditNot";
import MasterSharingEdit from "./master-sharing/SharingEdit";
// import MasterSharingDetail from "./master-sharing/SharingDetail";
// // Forum
import MasterForumAdd from "./master-forum/ForumAdd";
import MasterForumBefore from "./master-forum/ForumBefore";
// import MasterForumDetailNot from "./master-forum/ForumDetailNot";
// import MasterForumEditNot from "./master-forum/ForumEditNot";
import MasterForumEdit from "./master-forum/ForumEdit";
// import MasterForumDetail from "./master-forum/ForumDetail";
// // Post Test
import MasterPostTestAdd from "./master-posttest/PostTestAdd";
import MasterPostTestEdit from "./master-posttest/PostTestEdit";
import MasterPostTestEditNot from "./master-posttest/PostTestEditNot";
// import MasterPostTestDetail from "./master-posttest/PostTestDetail";
// // Kelompok Keahlian
import PilihKelompokKeahlian from "./Kelompok_Keahlian";
// import Masterpustakaa from "./pustaka";

//
import "../../../../style/Materi.css";



export default function MasterProses() {
  const [pageMode, setPageMode] = useState("kk");
  const [dataID, setDataID] = useState();
  const [dataID2, setDataID2] = useState();
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  AppContext_test.activeUser = activeUser;

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterProsesIndex 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "reviewjawaban":
        return <MasterMateriReviewJawaban
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "Pre-Test":
        return <MasterPreTestAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      // case "pretestAddNot":
      //   return <MasterPreTestAddNot 
      //           onChangePage={handleSetPageMode} 
      //           withID={dataID}/>;
      case "pretestEdit":
        return <MasterPreTestEdit 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pretestEditNot":
                  return <MasterPreTestEditNot
                          onChangePage={handleSetPageMode} 
                          withID={dataID}/>;
      // case "pretestDetail":
      //   return <MasterPreTestDetail 
      //           onChangePage={handleSetPageMode} 
      //           withID={dataID}/>;
      case "pengenalanAdd":
        return <PengenalanAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pengenalanEdit":
          return <PengenalanEdit 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pengenalanBefore":
          return <PengenalanBefore 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;

      case "materiAdd":
        return <MasterMateriAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "materiEdit":
        return <MasterMateriEdit 
              onChangePage={handleSetPageMode}             
              withID={dataID}/>;
      // case "materiDetail":
      //   return <MasterMateriDetail 
      //           onChangePage={handleSetPageMode}             
      //           withID={dataID}/>;
      case "Sharing Expert":
        return <MasterSharingAdd 
                onChangePage={handleSetPageMode}
                withID={dataID}
               />;
      // case "sharingDetailNot":
      //   return <MasterSharingDetailNot 
      //           onChangePage={handleSetPageMode}
      //           withID={dataID}
      //          />;
      case "sharingEdit":
        return <MasterSharingEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "sharingEditNot":
        return <MasterSharingEditNot 
                onChangePage={handleSetPageMode}
                withID={dataID}
                />;
      // case "sharingDetail":
      //   return <MasterSharingDetail 
      //           onChangePage={handleSetPageMode} 
      //           withID={dataID}/>;
      case "forumAdd":
        return <MasterForumAdd 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "forumBefore":
         return <MasterForumBefore 
                  onChangePage={handleSetPageMode} 
                  withID={dataID}/>;
      // case "forumDetailNot":
      //   return <MasterForumDetailNot
      //           onChangePage={handleSetPageMode}
      //           withID={dataID}/>;
      // case "forumEditNot":
      //   return <MasterForumEditNot
      //           onChangePage={handleSetPageMode}
      //           withID={dataID}/>;
      case "forumEdit":
        return <MasterForumEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      // case "forumDetail":
      //   return <MasterForumDetail 
      //           onChangePage={handleSetPageMode} 
      //           withID={dataID}/>;
      case "Post-Test":
        return <MasterPostTestAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "posttestEdit":
        return <MasterPostTestEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "posttestEditNot":
        return <MasterPostTestEditNot
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      // case "posttestDetail":
      //   return <MasterPostTestDetail 
      //           onChangePage={handleSetPageMode} 
      //           withID={dataID}/>;
      case "kk":
        return <PilihKelompokKeahlian 
                onChangePage={handleSetPageMode} />;
        //         case "pustaka":
        // return <Masterpustakaa 
        //         onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID,withIDKategori) {
    setDataID(withID);
    setDataID2(withIDKategori);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}