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
  const [selectedRoomShowtimes, setSelectedRoomShowtimes] = useState([]);

  const daysToShow = 7; // Số ngày hiển thị

  const weekDays = getWeekDays();

  useEffect(() => {
    // Lấy dữ liệu từ API Cinemas
    axios
      .get("http://localhost:5000/api/cinemas")
      .then((response) => {
        const transformedData = response.data.map((cinema) => ({
          id: cinema._id, // Đảm bảo `_id` tồn tại trong phản hồi API
          name: cinema.cinemaName,
          rooms: cinema.room.map((roomId) => ({
            id: roomId,
            showtimes: {},
          })),
        }));

        setCinemaData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching cinema data:", error);
      });
  }, []);

  // Lấy dữ liệu suất chiếu cho phòng của cinema
  const fetchShowtimesForCinema = async (cinemaId, cinemaRooms) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/showtimes/cinema/${cinemaId}`
      );
      const allShowtimes = response.data;

      // Lọc các showtimes có room trùng với room của cinema
      const filteredShowtimes = allShowtimes.filter((showtime) =>
        cinemaRooms.includes(showtime.room)
      );

      return filteredShowtimes;
    } catch (error) {
      console.error(
        "Error fetching showtimes:",
        error.response?.data || error.message
      );
      return [];
    }
  };

  // Hàm xử lý khi chọn rạp và lấy dữ liệu showtimes
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    const selectedCinema = cinemaData.find((cinema) =>
      cinema.rooms.some((cinemaRoom) => cinemaRoom.id === room.id)
    );
  
    if (selectedCinema) {
      const cinemaId = selectedCinema.id;
      
      // Fetch showtimes cho cinema và room đã chọn
      fetchShowtimesForCinema(cinemaId, [room.id]).then((showtimes) => {
        // Lọc suất chiếu cho ngày đã chọn (chỉ so sánh phần ngày)
        const filteredShowtimes = showtimes.filter((showtime) =>
          moment(showtime.date).format("YYYY-MM-DD") === selectedDate
        );
        setSelectedRoomShowtimes(filteredShowtimes);
      });
    }
  };
  
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

  const handleAddShowtimeClick = () => {
    setIsFormVisible(true); // Hiển thị form
  };

  const handleCloseForm = () => {
    setIsFormVisible(false); // Đóng form
  };

  const filteredShowtimes = showtimes.filter((showtime) =>
    moment(showtime.date).format("YYYY-MM-DD") === selectedDate
  );
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
    {theater.rooms.map((room, index) => {
      const roomShowtimes = room.showtimes[selectedDate] || [];
      return (
        <div
          key={room.id}
          className="room-number"
          onClick={() => handleSelectRoom(room)}
        >
          <h3>Rạp {index + 1}</h3>
          <p>
            Số suất chiếu:{" "}
            {roomShowtimes.filter((showtime) => showtime.movie !== null).length}
            /4
          </p>
        </div>
      );
    })}
  </div>

  {/* Hiển thị tất cả suất chiếu khi chọn một phòng */}
  {selectedRoom && selectedRoomShowtimes.length > 0 && (
    <div className="showtimes">
      {selectedRoomShowtimes.map((showtime, index) => (
        <div key={index} className="box-showtime">
          <h4>Suất chiếu {index + 1} ({showtime.times})</h4>
          {showtime.movie ? (
            <>
              <h5>Phim đang chiếu</h5>
              <div className="line"></div>
              <div className="poster">
                <img
                  src={showtime.movie.img}
                  alt={showtime.movie.title}
                />
              </div>
              <p>
                Tên phim: <span>{showtime.movie.title}</span>
              </p>
              <p>
                Thời gian: <span>{showtime.times}</span>
              </p>
              <a href="#" className="btn-room">
                {showtime.movie.isReleased ? "Xem doanh thu" : "Thay đổi lịch chiếu"}
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
      ))}
    </div>
  )}
  {selectedRoom && selectedRoomShowtimes.length === 0 && (
    <p>Không có suất chiếu cho ngày này</p>
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
