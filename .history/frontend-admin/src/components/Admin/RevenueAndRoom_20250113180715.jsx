import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import "./RevenueAndRoom.css";
import { IoTicketOutline } from "react-icons/io5";
import { LuGlassWater } from "react-icons/lu";
import { LuPopcorn } from "react-icons/lu";
import ShowtimeSelector from "./ShowtimeSelector";
import moment from "moment";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getWeekDays = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const date = moment().add(i, "days");
    days.push({
      day: capitalizeFirstLetter(date.format("dddd")),
      date: date.format("DD/MM"),
      fullDate: date.format("YYYY-MM-DD"),
    });
  }
  return days;
};

function RevenueAndRoom() {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getWeekDays()[0].fullDate);
  const [cinemaData, setCinemaData] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showtimesData, setShowtimesData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [pendingShowtimeIds, setPendingShowtimeIds] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState({
    totalSeatPrice: 0,
    totalFoodPrice: 0,
    totalSeat: 0,
    totalSeatN: 0,
    totalSeatV: 0,
    totalSeatC: 0,
    totalCombo: 0,
    totalCorn: 0,
    totalPepsi: 0,
  });

  const daysToShow = 7;
  const weekDays = getWeekDays();

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

  const countSeats = (seats) => {
    let seatN = 0; // Đếm số ghế normal
    let seatV = 0; // Đếm số ghế vip
    let seatC = 0; // Đếm số ghế khác (ví dụ: luxury, premium,...)

    // Duyệt qua từng phần tử trong mảng seat
    seats.forEach((seat) => {
      // Kiểm tra loại ghế và cập nhật số lượng ghế
      if (seat.typeSeat === "normal") {
        seatN += 1; // Ghế normal
      } else if (seat.typeSeat === "vip") {
        seatV += 1; // Ghế vip
      } else {
        seatC += 1; // Các loại ghế khác
      }
    });

    // Trả về kết quả phân loại số ghế
    return { seatN, seatV, seatC };
  };

  const countfoodNames = (foodNames) => {
    let corn = 0; // Đếm số bắp
    let pepsi = 0; // Đếm số nước
    let combo = 0; // Đếm số combo

    // Duyệt qua từng phần tử trong mảng seat
    foodNames.forEach((foodName) => {
      // Kiểm tra loại ghế và cập nhật số lượng ghế
      if (foodName.name === "Corn") {
        corn += 1; // Bắp
      } else if (foodName.name === "PepSi 32Oz") {
        pepsi += 1; // Nước
      } else {
        combo += 1; // Các loại khác
      }
    });

    // Trả về kết quả phân loại số ghế
    return { corn, pepsi, combo };
  };

  // Tính tổng doanh thu từ bookingData
  const calculateTotalRevenue = (data) => {
    return data.reduce(
      (total, item) => {
        const seatPrice = item.totalSeatPrice || 0;
        const foodPrice = item.totalFoodPrice || 0;
        const seat = Array.isArray(item.seat) ? item.seat : []; // Kiểm tra nếu seat là mảng
        const foodNames = item.foodNames || [];
  
        const { seatN, seatV, seatC } = countSeats(seat); // Phân loại ghế
        const { corn, pepsi, combo } = countfoodNames(foodNames); // Phân loại món ăn
  
        total.totalSeatPrice += seatPrice;
        total.totalFoodPrice += foodPrice;
        total.totalSeat += seat.length;  // Cộng dồn số ghế bán được
        total.totalSeatN += seatN;      // Ghế thường
        total.totalSeatV += seatV;      // Ghế VIP
        total.totalSeatC += seatC;      // Ghế khác
        total.totalCombo += combo;      // Combo
        total.totalCorn += corn;        // Món ngô
        total.totalPepsi += pepsi;      // Món Pepsi
  
        return total;
      },
      {
        totalSeatPrice: 0,
        totalFoodPrice: 0,
        totalSeat: 0,
        totalSeatN: 0,
        totalSeatV: 0,
        totalSeatC: 0,
        totalCombo: 0,
        totalCorn: 0,
        totalPepsi: 0,
      }
    );
  };
  
  
  
  useEffect(() => {
    if (showtimesData.length > 0) {
      const revenue = calculateTotalRevenue(bookingData);
      console.log('Calculated Revenue:', revenue); // Kiểm tra giá trị đã tính toán
      setTotalRevenue(revenue);
    }
  }, [bookingData]); // Kiểm tra nếu bookingData thay đổi
  

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/cinemas")
      .then((response) => {
        const transformedData = response.data.map((cinema) => ({
          id: cinema._id,
          name: cinema.cinemaName,
          rooms: cinema.room.map((roomId) => ({
            id: roomId,
            showtimes: {},
          })),
        }));
        setCinemaData(transformedData);
        if (transformedData.length > 0) {
          setSelectedCinema(transformedData[0].id);
        }
      })
      .catch((error) => {
        console.error("Error fetching cinema data:", error);
      });
  }, []);

// useEffect để fetch dữ liệu showtimes khi chọn rạp, ngày, và phòng
useEffect(() => {
  if (selectedCinema && selectedRoomId && selectedDate) {
    axios
      .get(`http://localhost:5000/api/showtimes/cinema/${selectedCinema}`)
      .then((response) => {
        const showtimes = response.data;

        // Format selected date
        const selectedDateFormatted = moment(selectedDate).format("YYYY-MM-DD");

        // Lọc các showtimes theo ngày và phòng đã chọn
        const selectedDateRoomShowtimes = showtimes.filter((showtime) => 
          showtime.days.some((day) => moment(day).format("YYYY-MM-DD") === selectedDateFormatted) &&
          showtime.room === selectedRoomId
        );

        setShowtimesData(selectedDateRoomShowtimes);
        console.log("Filtered Showtimes:", selectedDateRoomShowtimes);
      })
      .catch((error) => {
        console.error("Error fetching showtimes data:", error);
      });
  }
}, [selectedCinema, selectedDate, selectedRoomId]);
  
  
  

  // Fetch booking data for each showtime
  useEffect(() => {
    if (showtimesData.length > 0) {
      // Lấy thông tin booking cho từng showtime
      const fetchBookingData = async () => {
        try {
          const bookings = await Promise.all(
            showtimesData.map((showtime) =>
              axios.get(
                `http://localhost:5000/api/booking/showtime/${showtime._id}`
              )
            )
          );
          const allBookings = bookings.map((booking) => booking.data);
          setBookingData(allBookings.flat());
          console.log(allBookings)

          // Tính tổng doanh thu từ bookingData
          const revenue = calculateTotalRevenue(allBookings.flat());
          setTotalRevenue(revenue);
        } catch (error) {
          console.error("Error fetching booking data:", error);
        }
      };
      fetchBookingData();
    }
  }, [showtimesData]);

  useEffect(() => {
    if (selectedRoomId) {
      const roomShowtimes = showtimesData.filter(
        (showtime) => showtime.room === selectedRoomId
      );

      const roomBookings = bookingData.filter((booking) =>
        roomShowtimes.some((showtime) => showtime._id === booking.showtimeId)
      );

      const roomRevenue = calculateTotalRevenue(roomBookings);
      setTotalRevenue(roomRevenue);
    }
  }, [selectedRoomId, showtimesData, bookingData]);

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
  };

  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const currentCinema = cinemaData.find(
    (cinema) => cinema.id === selectedCinema
  );

  const selectedRoomShowtimes = showtimesData.filter(
    (showtime) => showtime.room === selectedRoomId
  );

  const selectedDateShowtimes = selectedRoomShowtimes.filter((showtime) =>
    moment(showtime.days).isSame(moment(selectedDate), "day")
  );

  return (
    <div className="container">
      <SideBar />
      <div className="main">
        <h2 className="subtitle">Revenue and screening room management</h2>
        <div className="box-container">
          <div className="dropdown-title">
            <select
              className="dropdown"
              value={selectedCinema || ""}
              onChange={handleCinemaChange}
            >
              {cinemaData.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          </div>
          <div className="content fix-h">
            <div className="buttonChooseDay"></div>
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
            <div className="screen hig">
      {/* Room selection section */}
      <div className="room w">
        {currentCinema?.rooms.map((room, index) => (
          <div
            key={room.id}
            className={`room-number ${selectedRoomId === room.id ? "selected-room" : ""}`}
            onClick={() => handleRoomClick(room.id)}
          >
            <h3>Rạp {index + 1}</h3>
          </div>
        ))}
      </div>

      {/* Showtime data display */}
      <div className="revenue">
        {selectedRoomId ? (
          <table className="table">
            <thead>
              <tr>
                <th>Suất Chiếu</th>
                <th>Tên Phim</th>
                <th>Giờ Chiếu</th>
                <th>Vé Bán</th>
                <th>SP Bán Kèm</th>
                <th>Doanh Thu</th>
              </tr>
            </thead>
            <tbody>
              {showtimesData.length > 0 ? (
                showtimesData.map((showtime, index) => (
                  <tr key={showtime._id}>
                  <td>{index + 1}</td> 
                    <td>{showtime.movie.title}</td>
                    <td>{showtime.times}</td>
                    <td>{totalRevenue.totalSeatV}</td>
                    <td>6</td>
                    <td>5.000.000 đ</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Không có suất chiếu trong ngày này cho phòng đã chọn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center" }}>
            Vui lòng chọn một phòng để hiển thị thông tin
          </p>
        )}
      </div>

      {/* Total revenue display */}
      {selectedRoomId && totalRevenue && (
        <div className="total-revenue-room">
          <div className="room-title">
            <h1>
              Tổng doanh thu rạp{" "}
              <span>
                {currentCinema?.rooms.findIndex(
                  (room) => room.id === selectedRoomId
                ) + 1}
              </span>
            </h1>
          </div>
          <div className="revenue-content">
            <h3>Ngày: {selectedDate}</h3>
            <h3>Loại Rạp: Basic</h3>
            <span>Vé Bán:</span>{" "}
            <span>
              <IoTicketOutline style={{ color: "green" }} />:{" "}
              {totalRevenue.totalSeatN}
            </span>{" "}
            <span>
              <IoTicketOutline style={{ color: "red" }} />:{" "}
              {totalRevenue.totalSeatV}
            </span>{" "}
            <span>
              <IoTicketOutline style={{ color: "purple" }} />:{" "}
              {totalRevenue.totalSeatC}
            </span>
            <div className="note">
              <p>
                <IoTicketOutline style={{ color: "green" }} />: Vé thường
              </p>
              <p>
                <IoTicketOutline style={{ color: "red" }} />: Vé Vip
              </p>
              <p>
                <IoTicketOutline style={{ color: "purple" }} />: Vé Couple
              </p>
            </div>
            <h3>Tổng:</h3>
            <div className="sumPrice">
              <p>{totalRevenue.totalSeatPrice} đ</p>
            </div>
            <span>SP bán kèm:</span>{" "}
            <span>
              <LuGlassWater />: {totalRevenue.totalPepsi}
            </span>{" "}
            <span>
              <LuPopcorn />: {totalRevenue.totalCorn}
            </span>{" "}
            <span>Cb: {totalRevenue.totalCombo}</span>
            <div className="note">
              <p>
                <LuGlassWater />: Nước uống
              </p>
              <p>
                <LuPopcorn />: Bắp Ngọt
              </p>
              <p>Cb: combo bắp & nước</p>
            </div>
            <h3>Tổng:</h3>
            <div className="sumPrice">
              <p>{totalRevenue.totalFoodPrice} đ</p>
            </div>
            <div className="line"></div>
            <div className="total">
              <h3>
                {totalRevenue.totalFoodPrice + totalRevenue.totalSeatPrice}{" "}
                đ
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueAndRoom;