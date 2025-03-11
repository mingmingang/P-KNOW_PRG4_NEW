import { useEffect, useState } from "react";
import logo from "../../assets/logoAstratech.png";
import "../../style/Header.css";
import Konfirmasi from "../part/Konfirmasi"; // Import your confirmation component
const activeURL = location.protocol + "//" + location.host + location.pathname;
import { API_LINK, APPLICATION_ID } from "../util/Constants";
import UseFetch from "../util/UseFetch";

function setActiveMenu(menu) {
  active_menu = menu;
}

export default function Header({
  showMenu = false,
  userProfile = {},
  listMenu,
  konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?",
  showUserInfo = true, // Prop to conditionally show/hide user info
}) {
  const [activeMenu, setActiveMenu] = useState("beranda");
  const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countNotifikasi, setCountNotifikasi] = useState("");
  // Icon mapping for sub-menu items
  const iconMapping = {
    "Kelola Kelompok Keahlian": "fas fa-cogs",
    "Kelola Anggota": "fas fa-users",
    "Daftar Pustaka": "fas fa-book",
    Materi: "fas fa-graduation-cap",
    "PIC Kelompok Keahlian": "fas fa-users",
    "Persetujuan Anggota Keahlian": "fas fa-check",
    "Pengajuan Kelompok Keahlian": "fas fa-paper-plane",
    "Riwayat Pengajuan": "fas fa-history",
    "Kelola Program": "fas fa-tasks",
    "Kelola Materi": "fas fa-book-open",
    "Class Repository": "fas fa-book-open",
    "LJ Create": "fas fa-book-open",
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleConfirmYes = () => {
    window.location.replace("/logout");
    setShowConfirmation(false); // Hide the confirmation dialog
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false); // Just close the confirmation modal
  };

  const handleLogoutClick = () => {
    setShowConfirmation(true); // Show confirmation modal on logout click
  };

  const handleNotification = () => {
    window.location.replace("/notifications"); // Redirect to login page
  };

  useEffect(() => {
    if (showMenu) {
      const activeMenuItem = listMenu.find((menu) => activeURL === menu.link);
      if (activeMenuItem) {
        setActiveMenu(activeMenuItem.head);
      }
    }
  }, [activeURL, listMenu, showMenu]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingNotifikasi",
          { application: APPLICATION_ID }
        );

        if (data === "ERROR") {
          throw new Error();
        } else {
          setCountNotifikasi(data[0].counting);
        }
      } catch {
        setCountNotifikasi("");
      }
    };
    fetchData();
  }, []);

  const [isNavOpen, setIsNavOpen] = useState(false); // Untuk kontrol nav baru

  // Toggle untuk nav baru
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // Membuka atau menutup nav baru
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div>
      <nav>
        <div className="logo">
          <img
            src={logo}
            alt="Logo ASTRAtech"
            title="Logo ASTRAtech"
            width="170px"
            height="40px"
          />
        </div>

        {showMenu && (
          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-center">
                {listMenu.map((menu) => {
                  if (menu.isHidden) return null;
                  const isActive = activeURL === menu.link;

                  return (
                    <li key={menu.headkey} className={isActive ? "active" : ""}>
                      <a
                        href={menu.link}
                        onClick={() => setActiveMenu(menu.head)}
                        // className={isActive ? "active" : ""}
                      >
                        <div className="menu-item">
                          {/* Render icon for main menu */}
                          {menu.icon && <i className={menu.icon}></i>}
                          <span>{menu.head}</span>
                          {/* Render a down-chevron icon if the menu is not "Beranda" */}
                          {menu.head !== "Beranda" &&
                            menu.head !== "Knowledge Database" && (
                              <i
                                className="fas fa-chevron-down"
                                aria-hidden="true"
                              ></i>
                            )}
                        </div>
                      </a>

                      {/* Render sub-menu if it exists */}
                      {menu.sub && menu.sub.length > 0 && (
                        <ul className="dropdown-content">
                          {menu.sub.map((sub) => {
                            // Determine the icon class based on sub-menu title
                            const iconClass = iconMapping[sub.title] || "";

                            return (
                              <li key={sub.link}>
                                <a
                                  href={sub.link}
                                  onClick={() =>
                                    setActiveMenu(`${menu.head} - ${sub.title}`)
                                  }
                                >
                                  {/* Render the icon if iconClass is set */}
                                  {iconClass && <i className={iconClass}></i>}
                                  <span>{sub.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="profile">
          {/* Conditionally render user info if showUserInfo is true */}
          {showUserInfo && (
            <>
              <div className="pengguna">
                <h3>{userProfile.name}</h3>
                <h4>{userProfile.role}</h4>
                <p>Terakhir Masuk: {userProfile.lastLogin}</p>
              </div>
            </>
          )}

          <div
            className="fotoprofil"
            onMouseEnter={() => setProfileDropdownVisible(true)} // Show dropdown on hover
            onMouseLeave={() => setProfileDropdownVisible(false)} // Hide dropdown when hover ends
          >
            {showUserInfo && (
              <>
                {userProfile.photo ? (
                  <img src={userProfile.photo} alt="Profile" />
                ) : (
                  <div
                    className="menu-profil-img"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#e0e7ff",
                      color: "#1a73e8",
                      fontWeight: "bold",
                      fontSize: "24px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    {getInitials(userProfile.name)}
                  </div>
                )}
              </>
            )}
            {isProfileDropdownVisible && (
              <ul className="profile-dropdown">
                <li>
                  <span
                    onClick={handleNotification}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-bell" style={{ color: "#0A5EA8" }}></i>{" "}
                    <span style={{ color: "#0A5EA8" }}>
                      Notifikasi{" "}
                      <span className="notif">{countNotifikasi}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleLogoutClick}
                    className="keluar"
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className="fas fa-sign-out-alt"
                      style={{ color: "red" }}
                    ></i>{" "}
                    <span style={{ color: "red" }}>Logout</span>
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
        {/* Hamburger Button */}
        {showUserInfo && (
        <div className="hamburger" onClick={toggleNav}>
          <i className={`fas fa-${isNavOpen ? "times" : "bars"}`}></i>{" "}
          {/* Toggle icon */}
        </div>
        )}
      </nav>
      {/* Tampilkan nav baru jika isNavOpen true */}
      {/* Tampilkan nav baru jika isNavOpen true */}
      {isNavOpen && (
        <div className="nav-overlay">
          <div className="close-btn" onClick={closeNav}>
            <i className="fas fa-times"></i>
          </div>

          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-vertical">
                {listMenu.map((menu) => {
                  if (menu.isHidden) return null;
                  const isActive = activeURL === menu.link;

                  return (
                    <li key={menu.headkey} className={isActive ? "active" : ""}>
                      <a
                        href={menu.link}
                        onClick={() => setActiveMenu(menu.head)}
                      >
                        <div className="menu-item">
                          {/* Render icon for main menu */}
                          {menu.icon && <i className={menu.icon}></i>}
                          <span>{menu.head}</span>
                          {/* Render a down-chevron icon if the menu has sub-menu */}
                          {menu.sub && menu.sub.length > 0 && (
                            <i
                              className="fas fa-chevron-down ml-2"
                              aria-hidden="true"
                            ></i>
                          )}
                        </div>
                      </a>

                      {/* Render sub-menu if it exists */}
                      {menu.sub && menu.sub.length > 0 && (
                        <ul className="dropdown-combobox">
                          {menu.sub.map((sub) => {
                            // Determine the icon class based on sub-menu title
                            const iconClass = iconMapping[sub.title] || "";

                            return (
                              <li key={sub.link}>
                                <a
                                  href={sub.link}
                                  onClick={() =>
                                    setActiveMenu(`${menu.head} - ${sub.title}`)
                                  }
                                >
                                  {/* Render the icon if iconClass is set */}
                                  {iconClass && <i className={iconClass}></i>}
                                  <span>{sub.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Show confirmation dialog if the state is true */}
      {showConfirmation && (
        <Konfirmasi
          title={konfirmasi} // Pass the title
          pesan={pesanKonfirmasi} // Pass the message
          onYes={handleConfirmYes} // Handle Yes click
          onNo={handleConfirmNo} // Handle No click
        />
      )}
    </div>
  );
}
