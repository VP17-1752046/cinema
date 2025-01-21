import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const QuickBooking = () => {
  const [selectedMovie, setSelectedMovie] = useState(""); // Lưu ID phim đã chọn
  const [selectedCinema, setSelectedCinema] = useState(""); // Lưu rạp đã chọn
  const [selectedDate, setSelectedDate] = useState(""); // Lưu ngày đã chọn
  const [selectedTime, setSelectedTime] = useState(""); // Lưu thời gian đã chọn
  const [showtimeId, setShowtimeId] = useState(""); // Lưu ID suất chiếu đã chọn
  const [showingMovies, setShowingMovies] = useState([]); // Danh sách phim
  const [cinemas, setCinemas] = useState([]); // Danh sách rạp
  const [availableDates, setAvailableDates] = useState([]); // Danh sách ngày chiếu cho phim
  const [availableTimes, setAvailableTimes] = useState({}); // Danh sách các suất chiếu với showtimeId

  // Fetch movies từ API khi component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/movies/released"
        );
        setShowingMovies(response.data); // Lưu danh sách phim vào state
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Fetch showtimes (rạp, ngày chiếu, và suất chiếu) khi phim được chọn
  const fetchShowtimesByMovieId = async (movieId) => {
    try {
      const response = await axios.get(
        `https://cinema-backend-zeta.vercel.app/api/showtimes/movie/${movieId}`
      );

      // Lấy danh sách các rạp chiếu (cinema)
      const cinemaList = response.data.map(
        (showtime) => showtime.cinema.cinemaName
      );
      setCinemas([...new Set(cinemaList)]); // Loại bỏ các rạp trùng lặp

      // Lấy tất cả các ngày chiếu (days) từ showtimes
      const daysList = response.data.reduce((acc, showtime) => {
        if (showtime.days && Array.isArray(showtime.days)) {
          showtime.days.forEach((day) => {
            const formattedDate = new Date(day).toLocaleDateString("vi-VN");
            if (!acc.includes(formattedDate)) acc.push(formattedDate);
          });
        }
        return acc;
      }, []);
      setAvailableDates(daysList); // Lưu danh sách ngày vào state

      // Lấy tất cả các suất chiếu (times) và showtimeId cho từng ngày
      const timesList = response.data.reduce((acc, showtime) => {
        if (showtime.days && Array.isArray(showtime.days)) {
          showtime.days.forEach((day) => {
            const formattedDate = new Date(day).toLocaleDateString("vi-VN");
            if (!acc[formattedDate]) {
              acc[formattedDate] = [];
            }

            acc[formattedDate].push({
              time: showtime.times,
              showtimeId: showtime._id,
              cinemaName: showtime.cinema.cinemaName, // Gắn thêm tên rạp
            });
          });
        }
        return acc;
      }, {});

      setAvailableTimes(timesList); // Lưu danh sách times vào state với showtimeId
    } catch (error) {
      console.error("Error fetching cinemas or showtimes:", error);
      setCinemas([]); // Nếu lỗi, đặt lại danh sách rạp
      setAvailableDates([]); // Đặt lại danh sách ngày
      setAvailableTimes({}); // Đặt lại danh sách times
    }
  };

  // Xử lý khi chọn phim
  const handleMovieChange = (movieId) => {
    setSelectedMovie(movieId);
    setSelectedCinema(""); // Reset selectedCinema khi chọn phim mới
    setSelectedDate(""); // Reset selectedDate khi chọn phim mới
    setSelectedTime(""); // Reset selectedTime khi chọn phim mới
    setShowtimeId(""); // Reset showtimeId khi chọn phim mới
    fetchShowtimesByMovieId(movieId); // Gọi API lấy danh sách rạp và ngày chiếu
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date) => {
    setSelectedDate(date);

    // Xử lý khi chọn ngày: lọc các suất chiếu cho ngày được chọn
    setSelectedTime(""); // Reset selectedTime khi chọn lại ngày mới
  };

  // Xử lý khi chọn suất chiếu
  const handleTimeChange = (time, showtimeId) => {
    setSelectedTime(time);
    setShowtimeId(showtimeId); // Lưu lại ID của showtime đã chọn
  };

  // Kiểm tra xem tất cả các bước đã được chọn chưa
  const isBookingValid =
    selectedMovie &&
    selectedCinema &&
    selectedDate &&
    selectedTime &&
    showtimeId;

  return (
    <div className="quick-booking-container mx-[15%]">
      {/* Dropdown chọn phim */}
      <div>
        <select
          value={selectedMovie}
          onChange={(e) => handleMovieChange(e.target.value)}
        >
          <option value="" disabled>
            Chọn Phim
          </option>
          {showingMovies.map((movie) => (
            <option key={movie._id} value={movie._id}>
              {movie.title}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown chọn rạp */}
      <div>
        <select
          value={selectedCinema}
          onChange={(e) => setSelectedCinema(e.target.value)}
          disabled={!selectedMovie}
        >
          <option value="" disabled>
            Chọn Rạp
          </option>
          {cinemas.map((cinema, index) => (
            <option key={index} value={cinema}>
              {cinema}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown chọn ngày */}
      <div>
        <select
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={!selectedCinema}
        >
          <option value="" disabled>
            Chọn Ngày
          </option>
          {availableDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown chọn suất */}
      <div>
        <select
          value={selectedTime}
          onChange={(e) =>
            handleTimeChange(
              e.target.value,
              e.target.options[e.target.selectedIndex].getAttribute("data-id")
            )
          }
          disabled={!selectedDate || !selectedCinema}
        >
          <option value="" disabled>
            Chọn Suất
          </option>
          {/* Lọc và sắp xếp các suất chiếu */}
          {availableTimes[selectedDate]
            ?.filter((showtime) => showtime.cinemaName === selectedCinema) // Lọc suất chiếu theo rạp
            .sort((a, b) => {
              // Chuyển đổi giờ thành số phút để sắp xếp
              const toMinutes = (time) => {
                const [hours, minutes] = time.split(":").map(Number);
                return hours * 60 + minutes;
              };
              return toMinutes(a.time) - toMinutes(b.time);
            })
            .map((showtime, index) => (
              <option
                key={index}
                value={showtime.time}
                data-id={showtime.showtimeId}
              >
                {showtime.time}
              </option>
            ))}
        </select>
      </div>

      {/* Nút mua vé */}
      <Link
        className={`btn ${!isBookingValid ? "disabled" : ""}`}
        to={`/Booking/${showtimeId}`} // Truyền showtimeId vào URL
        style={{
          pointerEvents: isBookingValid ? "auto" : "none",
          opacity: isBookingValid ? 1 : 0.5,
        }}
      >
        Mua vé nhanh
      </Link>
    </div>
  );
};

export default QuickBooking;
