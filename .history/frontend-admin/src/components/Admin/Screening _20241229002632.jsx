import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import ShowtimeSelector from "./ShowtimeSelector";
import moment from "moment";
import ShowtimeForm from "./ShowtimeForm";
import axios from "axios";

// Hàm viết hoa chữ cái đầu
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Hàm tính danh sách các ngày trong tuần
const getWeekDays = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    // Hiển thị 2 tuần
    const date = moment().add(i, "days");
    days.push({
      day: capitalizeFirstLetter(date.format("dddd")),
      date: date.format("DD/MM"),
      fullDate: date.format("YYYY-MM-DD"),
    });
  }
  return days;
};

function Screening() {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Trạng thái mở của dropdown
  const [selectedRoom, setSelectedRoom] = useState(null); // Phòng được chọn
  const [selectedDate, setSelectedDate] = useState(getWeekDays()[0].fullDate); // Ngày được chọn
  const [startIndex, setStartIndex] = useState(0); // Bắt đầu từ ngày nào
  const [isFormVisible, setIsFormVisible] = useState(false); // Quản lý hiển thị form
  const [cinemaData, setCinemaData] = useState([]); // Dữ liệu lấy từ API

  const daysToShow = 7; // Số ngày hiển thị

  const weekDays = getWeekDays();

  useEffect(() => {
    // Lấy dữ liệu từ API
    axios
      .get("http://localhost:5000/api/cinemas")
      .then((response) => {
        const transformedData = response.data.map((cinema) => ({
          name: cinema.cinemaName,
          rooms: cinema.room.map((room, index) => ({
            name: `Rạp ${index + 1}`,
            showtimes: {}, // Ban đầu không có dữ liệu suất chiếu
          })),
        }));
        setCinemaData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching cinema data:", error);
      });
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleNext = () => {
    if (startIndex + daysToShow < weekDays.length) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleAddShowtimeClick = () => {
    setIsFormVisible(true); // Hiển thị form
  };

  const handleCloseForm = () => {
    setIsFormVisible(false); // Đóng form
  };

  return (
    <div className="container">
      <SideBar />
      {isFormVisible && (
        <ShowtimeForm onClose={() => setIsFormVisible(false)} />
      )}
      <div className="main">
        <h2 className="subtitle">Screening Management</h2>
        {cinemaData.map((theater, theaterIndex) => (
          <div key={theater.name} className="dropdown-container">
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown(theaterIndex)}
            >
              {theater.name}
            </div>
            {openDropdownIndex === theaterIndex && (
              <div className="dropdown-menu">
                <div className="content">
                  {/* Showtime Selector */}
                  <ShowtimeSelector
                    weekDays={weekDays}
                    startIndex={startIndex}
                    daysToShow={daysToShow}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleNext={handleNext}
                    handlePrev={handlePrev}
                  />
                  <div className="line"></div>

                  <div className="screen">
                    <div className="room">
                      {theater.rooms.map((room) => (
                        <div
                          key={room}
                          className="room-number"
                          onClick={() => handleSelectRoom(room)}
                        >
                          <h3>{room.name}</h3>
                          <p>
                            Số suất chiếu:{" "}
                            {room.showtimes[selectedDate]
                              ? room.showtimes[selectedDate].filter(
                                  (showtime) => showtime.movie !== null
                                ).length
                              : 0}
                            /4
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Hiển thị suất chiếu */}
                    {selectedRoom && selectedRoom.showtimes[selectedDate] && (
                      <div className="showtimes">
                        {selectedRoom.showtimes[selectedDate].map(
                          (showtime, index) => (
                            <div key={index} className="box-showtime">
                              <h4>
                                Suất chiếu {index + 1} ({showtime.timeRange})
                              </h4>
                              {showtime.movie ? (
                                <>
                                  <h5>{showtime.movie.status}</h5>
                                  <div className="line"></div>
                                  <div className="poster">
                                    <img
                                      src={showtime.movie.poster}
                                      alt="Poster"
                                    />
                                  </div>
                                  <p>
                                    Tên phim:{" "}
                                    <span>{showtime.movie.title}</span>
                                  </p>
                                  <p>
                                    Thời gian:{" "}
                                    <span>{showtime.movie.duration} phút</span>
                                  </p>
                                  <a href="#" className="btn-room">
                                    {showtime.movie.status === "Phim đang chiếu"
                                      ? "Thay đổi lịch chiếu"
                                      : "Xem doanh thu"}
                                  </a>
                                </>
                              ) : (
                                <>
                                  <h5>Rạp trống</h5>
                                  <div className="line"></div>
                                  <a
                                    href="#"
                                    className="btn-room"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddShowtimeClick();
                                    }}
                                  >
                                    Thêm lịch chiếu
                                  </a>
                                </>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screening;