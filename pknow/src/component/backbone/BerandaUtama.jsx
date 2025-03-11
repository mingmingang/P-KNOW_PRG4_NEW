import React from "react";
import ceweVR from "../../assets/ceweVR_beranda.png";
import cowoTop from "../../assets/cowoTop_beranda.png";
import "../../style/Beranda.css";
import logo from "../../assets/logo.png";
import perusahaan from "../../assets/perusahaan.png";
import sample from "../../assets/pakHimawan.jpg";
import sample2 from "../../assets/pakRadix.png";
import sample3 from "../../assets/aang.jpg";
import iconAstra from "../../assets/iconAstra.png";
import pengguna from "../../assets/ppnaufal.png";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../style/Slider.css"; // Tambahkan styling sesuai kebutuhan

const sliderData = [
  { name: "Adila Ilma", role: "UX Designer", company: "CrescentRating", img: sample },
  { name: "Amadea Dewasanya", role: "Product Designer", company: "CrescentRating", img: sample2 },
  { name: "Debby Surya Pradana", role: "UI/UX Designer", company: "Ekosis", img: sample3 },
  { name: "Dialus Andari", role: "UI/UX Designer", company: "Universal Eco Pasific", img: sample },
  { name: "Hutami Septiana Raswaty", role: "Digital Product Manager", company: "Telkom Indonesia", img: sample },
];

function Slider() {
  return (
    <div className="slider-container" style={{background:"white", marginBottom:"200px", height:"500px"}}>
      <Swiper
        spaceBetween={20}
        slidesPerView={4}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
          1440: { slidesPerView: 4, spaceBetween: 40 },
        }}
      >
        {sliderData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="card">
              <img src={item.img} alt={item.name} className="card-img" />
              <div className="card-info">
                <h4>{item.name}</h4>
                <p>{item.role}</p>
                <p className="company">{item.company}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

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

export default function BerandaUtama() {
  const handleKnowledgeDatabase = () => {
    window.location.replace("/daftar_pustaka");
  };

  return (
    <div>
      <section className="sec1">
        <div className="ucapan">
          <h3>Selamat Datang di</h3>
          <h1>System Knowledge Management System</h1>
          <p>
            “Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih
            efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang
            tersedia dengan mengakses menu yang disediakan.”
          </p>
          <button onClick={handleKnowledgeDatabase}>Knowledge Database</button>
        </div>

        <div className="imgDatang">
          <img className="ceweVR" src={ceweVR} alt="Ilustrasi Cewek VR" />
          <img className="cowoTop" src={cowoTop} alt="Ilustrasi Cowok" />
        </div>
      </section>

      <section className="sec4" style={{ 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "space-between", 
}}>
  <h4 style={{ textAlign: "center", color: "white", paddingTop: "60px", fontWeight: "bold" }}>
    Penasaran dengan kampus ASTRAtech?
  </h4>
  <p style={{ textAlign: "center", color: "white" }} className="mt-4">
    ASTRAtech adalah value chain industri untuk penyediaan SDM unggul sekaligus kontribusi
    sosial mencerdaskan Bangsa. ASTRAtech memiliki banyak program studi yang memenuhi
    kebutuhan industri untuk melatih peserta didik dalam lingkungan kerja.
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
  <div style={{ textAlign: "center", marginTop: "auto" }}>
    <img src={iconAstra} alt="Icon ASTRA" />
  </div>
</section>

      <section className="sec5">
        <div className="company">
          <div className="perusahaan">
            <h3 style={{ color: "#0A5EA8",  fontWeight: "700" }}>
              P-KNOW telah bekerja sama dengan Perusahaan ASTRA yang tersebar diseluruh Indonesia
            </h3>
            <p>
              P-KNOW adalah platform pendidikan teknologi yang diciptakan oleh kampus ASTRAtech
              untuk menyediakan konten pembelajaran keterampilan digital dengan metode
              “blended-learning”.
            </p>
            <h4>
              Partner Perusahaan yang Bekerja Sama dengan ASTRAtech
            </h4>
            <img  src={perusahaan} alt="Perusahaan ASTRA" />
            <div className="mt-3">
              <button
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#0A5EA8",
                  color: "white",
                }}
              >
                Lihat Selengkapnya
              </button>
            </div>
          </div>
          <div className="logoAstratech" style={{ marginTop: "90px", marginRight: "100px" }}>
            <img src={logo} alt="Logo ASTRAtech" width="300px" />
          </div>
        </div>
      </section>
      <section className="" style={{backgroundColor:"white"}}>
        <div className="">
      <h4 style={{ textAlign: "center", color: "#0A5EA8", paddingTop: "60px", fontWeight: "bold" }}>
          Mentor dan Tenaga Pendidik P-KNOW
        </h4>
        </div>
        <Slider />
      </section>

      {/* <section className="sec6">
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "60px", fontWeight: "bold" }}>
          Apa Tanggapan P-Knowers Tentang P-KNOW System?
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }} className="mt-4">
          Manfaat dan kegunaan yang dirasakan oleh para P-Knowers ketika menggunakan P-KNOW System.
          Ayo menjadi salah satunya!
        </p>
        <div className="d-flex ml-4 mt-4">
          {comments.map((comment, index) => (
            <CommentCard key={index} {...comment} />
          ))}
        </div>
      </section> */}
    </div>
  );
}
