import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieList from "./MovieList";
import ShowtimeSelector from "./ShowtimeSelector";
import moment from "moment";
import "moment/locale/vi";

const MoviePage = ({ cinemaLocation }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  useEffect(() => {
    async function fetchShowtimes() {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/showtimes/location/${cinemaLocation}`
        );
        console.log("Showtimes API Data:", response.data); // Kiểm tra dữ liệu
        setShowtimes(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu suất chiếu.");
      } finally {
        setLoading(false);
      }
    }

    fetchShowtimes();
  }, [cinemaLocation]);

  const filteredShowtimes = showtimes.filter((showtime) => {
    if (!showtime.days) {
      console.error("Missing days in showtime:", showtime);
      return false; // Bỏ qua nếu không có thông tin ngày chiếu
    }

    // Nếu days là mảng, kiểm tra tất cả các ngày trong mảng
    const showtimeDates = Array.isArray(showtime.days)
      ? showtime.days
      : [showtime.days];

    return showtimeDates.some((day) => {
      const showtimeDate = moment(day);
      return (
        showtimeDate.isValid() &&
        showtimeDate.format("YYYY-MM-DD") === selectedDate
      );
    });
  });

  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const movieId = showtime.movie._id;

    if (!acc[movieId]) {
      acc[movieId] = {
        movie: showtime.movie,
        times: [],
      };
    }

    // Đảm bảo mỗi thời gian chiếu kèm theo ID suất chiếu
    const showtimeTimes = Array.isArray(showtime.times)
      ? showtime.times
      : [showtime.times];
    showtimeTimes.forEach((time) => {
      acc[movieId].times.push({
        id: showtime._id, // ID suất chiếu
        time: time, // Thời gian chiếu
      });
    });

    // Sắp xếp `times` theo thứ tự thời gian tăng dần
    acc[movieId].times.sort((a, b) => {
      const timeA = moment(a.time, "HH:mm");
      const timeB = moment(b.time, "HH:mm");
      return timeA.diff(timeB);
    });

    return acc;
  }, {});

  const daysToShow = 3;

  const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, "days");
      days.push({
        day: capitalizeFirstLetter(date.format("dddd")),
        date: date.format("DD/MM"),
        fullDate: date.format("YYYY-MM-DD"),
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleNext = () => {
    if (startIndex + daysToShow < weekDays.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <div>
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
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredShowtimes.length === 0 ? (
        <p className="text-gray-500">
          Không có suất chiếu nào cho ngày {selectedDate}.
        </p>
      ) : (
        <MovieList groupedShowtimes={groupedShowtimes} />
      )}
    </div>
  );
};

export default MoviePage;
