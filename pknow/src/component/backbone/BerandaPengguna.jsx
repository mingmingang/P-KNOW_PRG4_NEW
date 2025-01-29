import "../../style/BerandaPengguna.css";

export default function BerandaPengguna({
  backgroundPengguna,
  maskotUser,
  paddingTop,
  width,
  maskotHeight,
  marginLeft,
}) {
  const handleKnowledgeDatabase = () => {
    window.location.replace("/daftar_pustaka"); // Redirect to login page
}
  return (
    <div>
      <section
        className="background-beranda"
        style={{ backgroundImage: `url(${backgroundPengguna})` }}
      >
        <div className="ucapan">
          <h3>Selamat Datang</h3>
          <h1>Civitas Akademika ASTRAtech!</h1>
          <p>
            “Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih
            efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang
            tersedia dengan mengakses menu yang disediakan.”
          </p>
          <button onClick={handleKnowledgeDatabase}>Knowledge Database</button>
        </div>

        <div
          className="imgDatang-maskot"
          style={{
            paddingTop: paddingTop || "20vh", // Apply dynamic paddingTop, default is 20vh
            width: width || "27%", // Apply dynamic width, default is 27%
            height: "100%",
            marginLeft: marginLeft || "0px", // Ensure full height
          }}
        >
          <img
            className="maskot"
            src={maskotUser}
            alt="Ilustrasi Maskot User"
            style={{ height: maskotHeight || "100%" }} // Apply dynamic maskot height, default is 100%
          />
        </div>
      </section>
    </div>
  );
}
