import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Cookies from "js-cookie";
import { decryptId } from "./component/util/Encryptor";
import { BASE_ROUTE, ROOT_LINK } from "./component/util/Constants";
import CreateMenu from "./component/util/CreateMenu";
import CreateRoute from "./component/util/CreateRoute.jsx";
import profile from "./assets/avatar-pknow.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Login from "./component/page/login/Index";
import Logout from "./component/page/logout/Index";
import Header from "./component/backbone/Header";
import NotFound from "./component/page/not-found/Index.jsx";
import Footer from "./component/backbone/Footer.jsx";
import 'select2/dist/css/select2.min.css';  // Import Select2 CSS
import 'select2/dist/js/select2.min.js';   

export default function App() {
  const [listMenu, setListMenu] = useState([]);
  const [listRoute, setListRoute] = useState([]);
  const isLogoutPage = window.location.pathname.includes("logout");
  const cookie = Cookies.get("activeUser");
  if (isLogoutPage) return <Logout />;
  else if (!cookie) return <Login />;
  else {
    const userInfo = JSON.parse(decryptId(cookie));

    useEffect(() => {
      const getMenu = async () => {
        const menu = await CreateMenu(userInfo.role, userInfo.prodi);
        const route = CreateRoute.filter((routeItem) => {
          const pathExistsInMenu = menu.some((menuItem) => {
            if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
              return true;
            }
            if (menuItem.sub && menuItem.sub.length > 0) {
              return menuItem.sub.some(
                (subItem) =>
                  subItem.link.replace(ROOT_LINK, "") === routeItem.path
              );
            }
            return false;
          });

          return pathExistsInMenu;
        });

        route.push({
          path: "/*",
          element: <NotFound />,
        });

        setListMenu(menu);
        setListRoute(route);
      };

      getMenu();
    }, []);

    const currentDateTime = new Date().toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  
    const userProfile = {
      name: userInfo.nama,
      role: userInfo.peran,
      lastLogin: currentDateTime,
      photo:profile
    };

    // console.log("listRoute before RouterProvider:", listRoute);
    
    return (
      <>
        {listRoute.length > 0 && (
          <>
            <Header
        userProfile={userProfile} 
        listMenu={listMenu}
        isProfileDropdownVisible={true}
        showMenu={true}
      />
            <RouterProvider
                  router={createBrowserRouter(listRoute, {
                    basename: BASE_ROUTE,
                  })}
                />

            <div className="footer">
              <Footer/>
            </div>
          </>
        )}
      </>
    );
  }
}
