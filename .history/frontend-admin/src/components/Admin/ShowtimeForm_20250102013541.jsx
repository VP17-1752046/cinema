import React, { useState, useEffect } from "react";
import axios from "axios";

function ShowtimeForm({ onClose, cinemaName, roomNumber,selectedDate, cinemaId  }) {
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [movie, setMovie] = useState("");
  const [times, setTimes] = useState("");
  const [days, setDays] = useState([]);
  const [showtimeDate, setShowtimeDate] = useState("");



  const handleSubmit = (e) => {
    e.preventDefault();
    const showtimeData = {
      cinema: selectedCinema,
      movie,
      date: showtimeDate,
      days,
      times,
      room: selectedRoom,
    };
    // Call the API to create a showtime
    axios
      .post("http://localhost:5000/api/showtimes", showtimeData)
      .then((response) => {
        console.log("Showtime created:", response.data);
        onClose(); // Close form after submission
      })
      .catch((error) => {
        console.error("Error creating showtime:", error);
      });
  };

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  return (
    <div className="showtime-form">
      <h2>Thêm lịch chiếu</h2>
      <form onSubmit={handleSubmit}>
        {/* Cinema Selection */}
        <div className="form-group">
          <label htmlFor="cinema"> Cinema</label>
        <p>{cinemaName}</p>
        </div>

        {/* Room Selection */}
        <div className="form-group">
          <label htmlFor="room">Rạp ID</label>
        <p>{roomNumber}</p>
        </div>

        {/* Movie Name */}
        <div className="form-group">
          <label htmlFor="movie">Tên phim</label>
          <input
            type="text"
            id="movie"
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
            placeholder="Nhập tên phim"
          />
        </div>

        {/* Showtime Date */}
        <div className="form-group">
          <label htmlFor="date">Ngày chiếu</label>
          <input
            type="date"
            id="date"
            value={showtimeDate}
            onChange={(e) => setShowtimeDate(e.target.value)}
          />
        </div>

        {/* Showtime Times */}
        <div className="form-group">
          <label htmlFor="times">Giờ chiếu</label>
          <input
            type="text"
            id="times"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            placeholder="Nhập giờ chiếu"
          />
        </div>

        {/* Days of the week */}
        <div className="form-group">
          <label htmlFor="days">Ngày trong tuần</label>
          <p>{selectedDate}</p>
        </div>

        {/* Submit Button */}
        <div className="buttons">
          <button type="submit">Lưu</button>
          <button type="button" onClick={onClose}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShowtimeForm;