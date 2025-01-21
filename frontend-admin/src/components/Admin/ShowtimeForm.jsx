import React, { useState, useEffect } from "react";
import axios from "axios";

function ShowtimeForm({
  onClose,
  cinemaName,
  roomNumber,
  selectedDate,
  cinemaId,
  timeSlots, // Nhận timeSlots từ props
}) {
  const [selectedCinema, setSelectedCinema] = useState(cinemaId); // Giữ cinemaId từ props
  const [selectedRoom, setSelectedRoom] = useState(roomNumber); // Giữ roomNumber từ props
  const [selectedMovie, setSelectedMovie] = useState(null); // Giữ thông tin phim đã chọn
  const [movies, setMovies] = useState([]); // Danh sách phim
  const [showDate, setShowDate] = useState(""); // Lưu giá trị showDate của phim đã chọn
  const [times, setTimes] = useState(""); // Lưu giờ chiếu
  const [showtimeDate, setShowtimeDate] = useState(""); // Lưu ngày chiếu
  const [days, setDays] = useState([]); // Lưu ngày trong tuần (selectedDate)
  const [errorMessage, setErrorMessage] = useState(""); // Lưu thông báo lỗi nếu giờ không hợp lệ

  // Fetch danh sách phim đã phát hành
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/movies/released"
        );
        setMovies(response.data); // Lưu danh sách phim vào state
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Xử lý khi người dùng chọn một bộ phim
  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    const movie = movies.find((m) => m._id === movieId); // Tìm phim theo ID
    setSelectedMovie(movie); // Cập nhật phim đã chọn

    if (movie) {
      setShowDate(movie.showDate); // Cập nhật showDate của phim
    }
  };

  // Kiểm tra xem giờ nhập vào có nằm trong khung giờ hợp lệ không
  const validateTime = (inputTime) => {
    const selectedSlot = timeSlots.find((slot) => {
      const start = slot.start.split(":").map(Number);
      const end = slot.end.split(":").map(Number);
      const input = inputTime.split(":").map(Number);
      const startTime = new Date(2020, 1, 1, start[0], start[1]);
      const endTime = new Date(2020, 1, 1, end[0], end[1]);
      const inputTimeObj = new Date(2020, 1, 1, input[0], input[1]);
      return inputTimeObj >= startTime && inputTimeObj <= endTime;
    });
    return selectedSlot;
  };

  // Xử lý khi người dùng nhập giờ chiếu
  const handleTimeChange = (e) => {
    const inputTime = e.target.value;
    setTimes(inputTime);

    const validSlot = validateTime(inputTime);

    if (validSlot) {
      setErrorMessage(""); // Xóa lỗi nếu giờ hợp lệ
    } else {
      setErrorMessage("Giờ chiếu phải nằm trong các khung giờ đã chọn.");
    }
  };

  // Gửi dữ liệu form lên server
  const handleSubmit = (e) => {
    e.preventDefault();

    if (errorMessage) {
      return; // Nếu có lỗi, không cho phép submit
    }

    const showtimeData = {
      cinema: cinemaId, // Lấy cinemaId từ props
      movie: selectedMovie?._id, // Lấy movieId từ selectedMovie
      date: showDate, // Lấy showDate từ state
      days: selectedDate, // Lấy days từ selectedDate (props)
      times, // Lấy giờ chiếu từ state
      room: selectedRoom, // Lấy roomNumber từ props
    };

    // Gọi API để tạo lịch chiếu
    axios
      .post(
        "https://cinema-backend-zeta.vercel.app/api/showtimes",
        showtimeData
      )
      .then((response) => {
        console.log("Showtime created:", response.data);
        alert("Lịch chiếu đã được lưu thành công!"); // Hiển thị thông báo thành công
        onClose(); // Đóng form sau khi submit thành công
        setTimeout(() => {
          window.location.reload(); // Tự động tải lại trang sau 2 giây
        }, 2000);
      })
      .catch((error) => {
        console.error("Error creating showtime:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại sau!"); // Thông báo lỗi nếu có lỗi khi tạo lịch chiếu
      });
  };

  return (
    <div className="showtime-form">
      <h2>Thêm lịch chiếu</h2>
      <form onSubmit={handleSubmit}>
        {/* Cinema Selection */}
        <div className="form-group">
          <label htmlFor="cinema">Cụm rạp</label>
          <input
            type="text"
            id="cinema"
            value={cinemaName} // Hiển thị cinemaName
            disabled // Không cho phép thay đổi
          />
        </div>

        {/* Room Selection */}
        <div className="form-group">
          <label htmlFor="room">ID Phòng chiếu</label>
          <input
            type="text"
            id="room"
            value={roomNumber} // Hiển thị roomNumber
            disabled // Không cho phép thay đổi
          />
        </div>

        {/* Movie Selection */}
        <div className="form-group">
          <label htmlFor="movie">Chọn phim</label>
          <select
            id="movie"
            value={selectedMovie?._id || ""}
            onChange={handleMovieChange}
          >
            <option value="" disabled>
              Chọn phim
            </option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Show Date */}
        <div className="form-group">
          <label htmlFor="showDate">Ngày chiếu</label>
          <input
            type="text"
            id="showDate"
            value={showDate} // Hiển thị showDate của phim
            disabled // Không cho phép thay đổi
          />
        </div>

        {/* TimeSlots (Read-only) */}
        <div className="form-group">
          <label htmlFor="timeSlots">Khung giờ</label>
          <div style={{ marginBottom: "10px" }}>
            {timeSlots.length > 0 ? (
              timeSlots.map((slot, index) => (
                <div key={index}>
                  {slot.start} - {slot.end}
                </div>
              ))
            ) : (
              <p>Không có thời gian chiếu nào.</p>
            )}
          </div>
        </div>

        {/* Showtime Times (User input) */}
        <div className="form-group">
          <label htmlFor="times">Giờ chiếu</label>
          <input
            type="time"
            id="times"
            value={times}
            onChange={handleTimeChange} // Cập nhật giờ chiếu khi người dùng chọn
            placeholder="Nhập giờ chiếu"
          />
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </div>

        {/* Days of the week */}
        <div className="form-group">
          <label htmlFor="days">Ngày trong tuần</label>
          <input
            type="text"
            id="days"
            value={selectedDate} // Hiển thị selectedDate từ props
            disabled // Không cho phép thay đổi
          />
        </div>

        {/* Submit Button */}
        <div className="buttons">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" disabled={!!errorMessage}>
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShowtimeForm;
