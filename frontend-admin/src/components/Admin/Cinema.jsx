import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideBar";
import "./Admin.css";

const Cinema = () => {
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null); // Lưu thông tin rạp được chọn
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Chỉ số ảnh hiện tại trong slider

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/cinemas/"
        );
        setCinemas(response.data);
        setIsLoading(false);
      } catch (error) {
        setError("Failed to fetch cinemas. Please try again.");
        setIsLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  // Tự động chuyển ảnh sau 5 giây
  useEffect(() => {
    if (selectedCinema) {
      const timer = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % selectedCinema.img01.length
        );
      }, 5000);
      return () => clearInterval(timer); // Xóa interval khi component unmount hoặc thay đổi cinema
    }
  }, [selectedCinema]);

  const handleCinemaClick = (cinema) => {
    setSelectedCinema(cinema); // Cập nhật rạp chiếu được chọn
    setCurrentImageIndex(0); // Đặt lại chỉ số ảnh khi chọn rạp mới
  };

  const handleBackClick = () => {
    setSelectedCinema(null); // Quay lại danh sách
  };

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedCinema.img01.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % selectedCinema.img01.length
    );
  };

  return (
    <div className="container">
      <Sidebar />
      <main className="main">
        {isLoading ? (
          <p>Loading cinemas...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : selectedCinema ? (
          // Hiển thị chi tiết rạp chiếu
          <div className="cinema-detail">
            <button onClick={handleBackClick} className="back-button">
              Quay lại
            </button>
            <h1 className="cinema-detail-name">{selectedCinema.cinemaName}</h1>
            <div className="cinema-detail-img">
              <button className="prev-button" onClick={handlePrevClick}>
                &#8249;
              </button>
              <img
                src={selectedCinema.img01[currentImageIndex]}
                alt={`${selectedCinema.cinemaName} ${currentImageIndex}`}
                className="slider-image"
              />
              <button className="next-button" onClick={handleNextClick}>
                &#8250;
              </button>
            </div>
            <p className="cinema-detail-location">
              <strong>Khu vực:</strong> {selectedCinema.location}
            </p>
            <p className="cinema-detail-address">
              <strong>Địa chỉ:</strong> {selectedCinema.address}
            </p>
            <p className="cinema-detail-intro1">{selectedCinema.introduce01}</p>
            <p className="cinema-detail-intro2">{selectedCinema.introduce02}</p>
            {/* <div className="cinema-detail-room">
              <p>Rạp:</p>
              <p className="room-element">{selectedCinema.room[0]}</p>
              <p className="room-element">{selectedCinema.room[1]}</p>
              <p className="room-element">{selectedCinema.room[2]}</p>
            </div> */}
          </div>
        ) : (
          // Hiển thị danh sách rạp chiếu
          <div>
            <h2 className="subtitle">Cinema</h2>
            <div className="cinema">
              {cinemas.map((cinema) => (
                <div className="cinema-element" key={cinema._id}>
                  <div className="title">
                    <h4 className="cinema-location">{cinema.location}</h4>
                    <span onClick={() => handleCinemaClick(cinema)}>
                      Chi tiết
                    </span>
                  </div>

                  <img
                    src={cinema.img01[0]}
                    alt={cinema.cinemaName}
                    className="cinema-img"
                  />
                  <h4 className="cinema-name">{cinema.cinemaName}</h4>
                  {/* <div className="cinema-address">
                    Địa chỉ: {cinema.address}
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cinema;
