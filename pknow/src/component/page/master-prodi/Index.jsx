import React from "react";
import Slider from "react-slick";
import "../../../style/BerandaProdi.css"; // Custom CSS for styling
import maskotP4 from "../../../assets/backBeranda/MaskotP4.png";
import maskotTPM from "../../../assets/backBeranda/maskotTPM.png";
import maskotMI from "../../../assets/backBeranda/MaskotMI.png";
import maskotMO from "../../../assets/backBeranda/MaskotMO.png";
import maskotMK from "../../../assets/backBeranda/MaskotMK.png";
import maskotTKBG from "../../../assets/backBeranda/MaskotTKBG.png";
import maskotTRPAB from "../../../assets/backBeranda/MaskotTRPAB.png";
import maskotTRL from "../../../assets/backBeranda/MaskotTRL.png";
import maskotTRPL from "../../../assets/backBeranda/MaskotTRPL.png";
import backgroundP4 from "../../../assets/BackBeranda/BackgroundP4.png";
import backgroundTPM from "../../../assets/BackBeranda/BackgroundTPM.png";
import backgroundMI from "../../../assets/BackBeranda/BackgroundMI.png";
import backgroundMO from "../../../assets/BackBeranda/BackgroundMO.png";
import backgroundMK from "../../../assets/BackBeranda/BackgroundMK.png";
import backgroundTKBG from "../../../assets/BackBeranda/BackgroundTKBG.png";
import backgroundTRPAB from "../../../assets/BackBeranda/BackgroundTRPAB.png";
import backgroundTRL from "../../../assets/BackBeranda/BackgroundTRL.png";
import backgroundTRPL from "../../../assets/BackBeranda/BackgroundTRPL.png";
import pengguna from "../../../assets/ppnaufal.png";
import iconAstra from "../../../assets/iconAstra.png";
import perusahaan from "../../../assets/perusahaan.png";
import logo from "../../../assets/logo.png";
import "../../../style/Beranda.css";

export default function Prodi() {
  const handleKnowledgeDatabase = () => {
    window.location.replace("/daftar_pustaka"); // Redirect to login page
  };

  const slidesData = [
    {
      title: "Program Studi Teknik Produksi Dan Proses Manufaktur",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundP4, // Unique background image for this slide
      mascot: maskotP4,
    },
    {
      title: "Teknik Produksi dan Proses Manufaktur",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTPM, // Unique background image for this slide
      mascot: maskotTPM,
    },
    {
      title: "Manajemen Informatika",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMI, // Unique background image for this slide
      mascot: maskotMI,
    },
    {
      title: "Mesin Otomotif",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMO, // Unique background image for this slide
      mascot: maskotMO,
    },
    {
      title: "Mekatronika",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMK, // Unique background image for this slide
      mascot: maskotMK,
    },
    {
      title: "Teknologi Konstruksi Bangunan Gedung",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTKBG, // Unique background image for this slide
      mascot: maskotTKBG,
    },
    {
      title: "Teknologi Rekayasa Pemeliharaan Alat Berat",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRPAB, // Unique background image for this slide
      mascot: maskotTRPAB,
    },
    {
      title: "Teknologi Rekayasa Logistik",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRL, // Unique background image for this slide
      mascot: maskotTRL,
    },
    {
      title: "Teknologi Rekayasa Perangkat Lunak",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRPL, // Unique background image for this slide
      mascot: maskotTRPL,
    },
  ];

  const comments = [
    {
      name: "Naufal",
      role: "UI/UX Designer di Eureka",
      text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
      img: pengguna,
    },
    {
      name: "Naufal",
      role: "UI/UX Designer di Eureka",
      text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
      img: pengguna,
    },
    {
      name: "Naufal",
      role: "UI/UX Designer di Eureka",
      text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
      img: pengguna,
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 1300,
  };

  function CommentCard({ name, role, text, img }) {
    return (
      <div className="comment">
        <div className="d-flex">
          <div className="mr-3">
            <img src={img} alt={name} />
          </div>
          <div>
            <h4>{name}</h4>
            <p>{role}</p>
          </div>
        </div>
        <div className="isi">{text}</div>
      </div>
    );
  }

  return (
    <>
      <div className="slider-container">
        <Slider {...settings}>
          {slidesData.map((slide, index) => (
            <div key={index} className="slide">
              <div
                className="content-wrapper"
                style={{
                  backgroundImage: `url(${slide.backgroundImage})`,
                  height: "100vh",
                }}
              >
                <div className="text-content">
                  <h1>{slide.title}</h1>
                  <p style={{width:"700px"}}>{slide.subtitle}</p>
                  <button
                    className="action-button"
                    onClick={handleKnowledgeDatabase}
                  >
                    {slide.buttonText}
                  </button>
                </div>
                <div className="mascot">
                  <img src={slide.mascot} alt="Mascot" />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <section className="sec4">
        <h4
          style={{
            textAlign: "center",
            color: "white",
            paddingTop: "60px",
            fontWeight: "bold",
          }}
        >
          Penasaran dengan kampus ASTRAtech?
        </h4>
        <p
          style={{
            textAlign: "center",
            color: "white",
            fontSize: "14px",
            margin: "10px 200px",
          }}
          className="mt-4"
        >
          ASTRAtech adalah value chain industri untuk penyediaan SDM unggul
          sekaligus kontribusi sosial mencerdaskan Bangsa. ASTRAtech memiliki
          banyak program studi yang memenuhi kebutuhan industri untuk melatih
          peserta didik dalam lingkungan kerja.
        </p>
        <div style={{ textAlign: "center" }}>
          <button
            style={{
              border: "none",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: "white",
              color: "#0A5EA8",
              fontWeight: "600",
            }}
          >
            Tentang ASTRAtech
          </button>
        </div>
        <div
          className="mb-0"
          style={{ textAlign: "center", marginTop: "110px" }}
        >
          <img src={iconAstra} alt="Icon ASTRA" />
        </div>
      </section>

      <section className="sec5">
        <div className="d-flex">
          <div
            className="perusahaan"
            style={{ marginTop: "60px", marginLeft: "40px" }}
          >
            <h3 style={{ color: "#0A5EA8", width: "80%", fontWeight: "700" }}>
              P-KNOW telah bekerja sama dengan Perusahaan ASTRA yang tersebar
              diseluruh Indonesia
            </h3>
            <p
              style={{
                textAlign: "justify",
                width: "70%",
                marginTop: "20px",
                color: "#717375",
              }}
            >
              P-KNOW adalah platform pendidikan teknologi yang diciptakan oleh
              kampus ASTRAtech untuk menyediakan konten pembelajaran
              keterampilan digital dengan metode “blended-learning”.
            </p>
            <h4 style={{ marginTop: "20px", fontSize: "18px" }}>
              Partner Perusahaan yang Bekerja Sama dengan ASTRAtech
            </h4>
            <img src={perusahaan} alt="Perusahaan ASTRA" />
            <div className="mt-3">
              <button
                style={{
                  border: "none",
                  padding: "15px",
                  borderRadius: "10px",
                  backgroundColor: "#0A5EA8",
                  color: "white",
                }}
              >
                Lihat Selengkapnya
              </button>
            </div>
          </div>
          <div
            className="logoAstratech"
            style={{ marginTop: "90px", marginRight: "100px" }}
          >
            <img src={logo} alt="Logo ASTRAtech" width="300px" />
          </div>
        </div>
      </section>

      <section className="sec6">
        <h4
          style={{
            textAlign: "center",
            color: "white",
            paddingTop: "60px",
            fontWeight: "bold",
          }}
        >
          Apa Tanggapan P-Knowers Tentang P-KNOW System?
        </h4>
        <p
          style={{ textAlign: "center", color: "white", fontSize: "14px" }}
          className="mt-4"
        >
          Manfaat dan kegunaan yang dirasakan oleh para P-Knowers ketika
          menggunakan P-KNOW System. Ayo menjadi salah satunya!
        </p>
        <div className="d-flex ml-4 mt-4">
          {comments.map((comment, index) => (
            <CommentCard key={index} {...comment} />
          ))}
        </div>
      </section>
    </>
  );
}
