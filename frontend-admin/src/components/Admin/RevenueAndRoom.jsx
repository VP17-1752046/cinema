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
  const [calculatedRevenues, setCalculatedRevenues] = useState([]);
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
    totalDiscout: 0,
    totalPrice: 0,
    totalDiscount12: 0,
    totalDiscount5: 0,
    totalDiscount10: 0,
    totalDiscount20: 0,
    totalDiscount30: 0,
    totalDiscount40: 0,
    totalDiscount50: 0,
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

  const calculateTotalRevenue = (data) => {
    return data.reduce(
      (total, item) => {
        const seat = Array.isArray(item.seat) ? item.seat : [];
        const foodNames = item.foodNames || [];
        const discount = item.discountId ? item.discountId.name : "No Discount";

        console.log("Processing Item:", item); // In item hiện tại
        console.log("Discount Applied:", discount);
        console.log("Total Price for Item:", item.totalPrice || 0);

        const { seatN, seatV, seatC } = countSeats(seat);
        const { corn, pepsi, combo } = countfoodNames(foodNames);

        return {
          totalSeatPrice: total.totalSeatPrice + (item.totalSeatPrice || 0),
          totalFoodPrice: total.totalFoodPrice + (item.totalFoodPrice || 0),
          totalSeat: total.totalSeat + seat.length,
          totalSeatN: total.totalSeatN + seatN,
          totalSeatV: total.totalSeatV + seatV,
          totalSeatC: total.totalSeatC + seatC,
          totalCombo: total.totalCombo + combo,
          totalCorn: total.totalCorn + corn,
          totalPepsi: total.totalPepsi + pepsi,
          totalDiscount:
            total.totalDiscount +
            (item.discountId ? item.totalPrice * 0.12 : 0), // Assuming a 12% discount for simplicity
          totalPrice:
            total.totalPrice +
            (item.totalSeatPrice || 0) +
            (item.totalFoodPrice || 0),
        };
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
        totalDiscount: 0, // Initialize total discount
        totalPrice: 0, // Initialize total revenue
      }
    );
  };

  const handleBookingUpdate = (data) => {
    let totalSeatPrice = 0;
    let totalFoodPrice = 0;
    let totalSeat = 0;
    let totalSeatV = 0;
    let totalSeatN = 0;
    let totalSeatC = 0;
    let totalCombo = 0;
    let totalCorn = 0;
    let totalPepsi = 0;
    let totalPrice = 0;
    let totalDiscount12 = 0;
    let totalDiscount5 = 0;
    let totalDiscount10 = 0;
    let totalDiscount20 = 0;
    let totalDiscount30 = 0;
    let totalDiscount40 = 0;
    let totalDiscount50 = 0;

    data.forEach((booking) => {
      // Kiểm tra xem booking có dữ liệu không
      if (booking && booking.seat && booking.foodNames) {
        // Cộng dồn giá trị từ booking
        totalSeatPrice += booking.totalSeatPrice;
        totalFoodPrice += booking.totalFoodPrice;
        totalPrice += booking.totalPrice;
        totalSeat += booking.seat.length;

        if (booking.discountId.name === "Giảm giá 12%") {
          totalDiscount12 += 1;
        } else if (booking.discountId.name === "Giảm giá 5%") {
          totalDiscount5 += 1;
        } else if (booking.discountId.name === "Giảm giá 10%") {
          totalDiscount10 += 1;
        } else if (booking.discountId.name === "Giảm giá 20%") {
          totalDiscount20 += 1;
        } else if (booking.discountId.name === "Giảm giá 30%") {
          totalDiscount30 += 1;
        } else if (booking.discountId.name === "Giảm giá 40%") {
          totalDiscount40 += 1;
        } else {
          totalDiscount50 += 1;
        }

        booking.seat.forEach((seat) => {
          if (seat.typeSeat === "vip") {
            totalSeatV += 1;
          } else if (seat.typeSeat === "normal") {
            totalSeatN += 1;
          } else if (seat.typeSeat === "couple") {
            totalSeatC += 1;
          }
        });

        booking.foodNames.forEach((foodName) => {
          if (foodName.name === "Corn") {
            totalCorn += 1;
          } else if (foodName.name === "PepSi 32Oz") {
            totalPepsi += 1;
          } else if (
            foodName.name &&
            foodName.name !== "Corn" &&
            foodName.name !== "PepSi 32Oz"
          ) {
            totalCombo += 1;
          }
        });
      }
    });

    // Cập nhật lại tổng doanh thu
    setTotalRevenue((prevRevenue) => ({
      totalSeatPrice: prevRevenue.totalSeatPrice + totalSeatPrice,
      totalFoodPrice: prevRevenue.totalFoodPrice + totalFoodPrice,
      totalPrice: prevRevenue.totalPrice + totalPrice,
      totalSeat: prevRevenue.totalSeat + totalSeat,
      totalSeatN: prevRevenue.totalSeatN + totalSeatN,
      totalSeatV: prevRevenue.totalSeatV + totalSeatV,
      totalSeatC: prevRevenue.totalSeatC + totalSeatC,
      totalCombo: prevRevenue.totalCombo + totalCombo,
      totalCorn: prevRevenue.totalCorn + totalCorn,
      totalPepsi: prevRevenue.totalPepsi + totalPepsi,
      totalDiscount12: totalDiscount12,
      totalDiscount5: totalDiscount5,
      totalDiscount10: totalDiscount10,
      totalDiscount20: totalDiscount20,
      totalDiscount30: totalDiscount30,
      totalDiscount40: totalDiscount40,
      totalDiscount50: totalDiscount50,
    }));
  };

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

  useEffect(() => {
    if (bookingData.length > 0) {
      const revenue = calculateTotalRevenue(bookingData);
      setTotalRevenue(revenue); // Đảm bảo chỉ gọi setTotalRevenue một lần
      console.log("Updated totalRevenue:", revenue); // In ra giá trị mới sau khi tính toán
    }
  }, [bookingData]); // Chỉ gọi khi bookingData thay đổi

  useEffect(() => {
    console.log("Updated totalSeatV:", totalRevenue.totalSeatV);
  }, [totalRevenue]); // In ra giá trị mỗi khi totalRevenue thay đổi

  useEffect(() => {
    console.log("Updated totalRevenue:", totalRevenue); // In ra tổng doanh thu sau mỗi lần cập nhật
  }, [totalRevenue]); // Khi totalRevenue thay đổi

  useEffect(() => {
    axios
      .get("https://cinema-backend-zeta.vercel.app/api/cinemas")
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
        .get(
          `https://cinema-backend-zeta.vercel.app/api/showtimes/cinema/${selectedCinema}`
        )
        .then((response) => {
          const showtimes = response.data;

          // Format selected date
          const selectedDateFormatted =
            moment(selectedDate).format("YYYY-MM-DD");

          // Lọc các showtimes theo ngày và phòng đã chọn
          const selectedDateRoomShowtimes = showtimes.filter(
            (showtime) =>
              showtime.days.some(
                (day) =>
                  moment(day).format("YYYY-MM-DD") === selectedDateFormatted
              ) && showtime.room === selectedRoomId
          );

          setShowtimesData(selectedDateRoomShowtimes);
          console.log("Filtered Showtimes:", selectedDateRoomShowtimes);
        })
        .catch((error) => {
          console.error("Error fetching showtimes data:", error);
        });
    }
  }, [selectedCinema, selectedDate, selectedRoomId]);

  useEffect(() => {
    if (showtimesData.length > 0) {
      const fetchBookingData = async () => {
        try {
          const bookings = await Promise.all(
            showtimesData.map((showtime) =>
              axios.get(
                `https://cinema-backend-zeta.vercel.app/api/booking/showtime/${showtime._id}`
              )
            )
          );

          const allBookings = bookings.map((booking) => booking.data);
          console.log("all", allBookings);

          // Gọi hàm handleBookingUpdate để cập nhật tổng doanh thu
          const flattenedBookings = allBookings.flat(); // Chuyển từ mảng lồng nhau thành mảng phẳng
          handleBookingUpdate(flattenedBookings);

          // Tính toán doanh thu cho từng suất chiếu
          const calculatedRevenue = showtimesData.map((showtime, index) => {
            const bookingList = allBookings[index] || [];

            let totalSeatPrice = 0;
            let totalFoodPrice = 0;
            let totalSeat = 0;
            let totalVIPSeats = 0;
            let totalfoodNames = 0;
            let totalPrice = 0;
            let totalDiscount = 0;

            bookingList.forEach((booking) => {
              totalSeatPrice += booking.totalSeatPrice;
              totalFoodPrice += booking.totalFoodPrice;
              totalSeat += booking.seat.length;
              totalPrice += booking.totalPrice;
              totalDiscount += booking.discountId ? 1 : 0;
              totalfoodNames += booking.foodNames.length;
            });

            return {
              showtimeId: showtime._id,
              totalSeatPrice,
              totalFoodPrice,
              totalSeat,
              totalVIPSeats,
              totalfoodNames,
              totalPrice,
              totalDiscount,
            };
          });

          setCalculatedRevenues(calculatedRevenue); // Lưu vào state
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
                    className={`room-number ${
                      selectedRoomId === room.id ? "selected-room" : ""
                    }`}
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
                        <th>Vé Giảm giá</th>
                        <th>Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showtimesData.length > 0 ? (
                        showtimesData.map((showtime, index) => {
                          // Lọc bookingData theo showtime hiện tại
                          const revenue = calculatedRevenues.find(
                            (revenue) => revenue.showtimeId === showtime._id
                          ) || {
                            totalSeat: 0,
                            totalVIPSeats: 0,
                            totalCombo: 0,
                            totalSeatPrice: 0,
                            totalFoodPrice: 0,
                            totalPrice: 0,
                            totalDiscount: 0,
                          }; // Nếu không tìm thấy, đặt giá trị mặc định

                          return (
                            <tr key={showtime._id}>
                              <td>{index + 1}</td>
                              <td>{showtime.movie.title}</td>
                              <td>{showtime.times}</td>
                              <td>{revenue.totalSeat}</td>

                              <td>{revenue.totalfoodNames}</td>
                              <td>{revenue.totalDiscount}</td>

                              <td>
                                <td>
                                  {revenue.totalPrice
                                    ? revenue.totalPrice.toLocaleString()
                                    : "0"}{" "}
                                  đ
                                </td>
                              </td>
                            </tr>
                          );
                        })
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

                    {/* Số lượng vé bán */}
                    <div className="ticket-sales">
                      <span>Vé Bán:</span>
                      <span>
                        <IoTicketOutline style={{ color: "green" }} />:{" "}
                        {totalRevenue.totalSeatN}
                      </span>
                      <span>
                        <IoTicketOutline style={{ color: "red" }} />:{" "}
                        {totalRevenue.totalSeatV}
                      </span>
                      <span>
                        <IoTicketOutline style={{ color: "purple" }} />:{" "}
                        {totalRevenue.totalSeatC}
                      </span>
                    </div>
                    <div className="note">
                      <p>
                        <IoTicketOutline style={{ color: "green" }} />: Vé
                        thường
                      </p>
                      <p>
                        <IoTicketOutline style={{ color: "red" }} />: Vé Vip
                      </p>
                      <p>
                        <IoTicketOutline style={{ color: "purple" }} />: Vé
                        Couple
                      </p>
                    </div>

                    {/* Tổng doanh thu vé */}
                    <h3>Doanh thu vé:</h3>
                    <div className="sumPrice">
                      <p>{totalRevenue.totalSeatPrice.toLocaleString()} đ</p>
                    </div>

                    {/* Sản phẩm bán kèm */}
                    <div className="add-on-sales">
                      <span>SP bán kèm:</span>
                      <span>
                        <LuGlassWater />: {totalRevenue.totalPepsi}
                      </span>
                      <span>
                        <LuPopcorn />: {totalRevenue.totalCorn}
                      </span>
                      <span>Cb: {totalRevenue.totalCombo}</span>
                    </div>
                    <div className="note">
                      <p>
                        <LuGlassWater />: Nước uống
                      </p>
                      <p>
                        <LuPopcorn />: Bắp Ngọt
                      </p>
                      <p>Cb: Combo bắp & nước</p>
                    </div>

                    {/* Tổng doanh thu sản phẩm */}
                    <h3>Doanh thu sản phẩm:</h3>
                    <div className="sumPrice">
                      <p>{totalRevenue.totalFoodPrice.toLocaleString()} đ</p>
                    </div>

                    <h3>Vé giảm giá</h3>
                    <div className="note">
                      <p>vé giảm 5%: {totalRevenue.totalDiscount5} /5</p>
                      <p>vé giảm 12%: {totalRevenue.totalDiscount12}/12</p>
                      <p>vé giảm 20%: {totalRevenue.totalDiscount20}/20</p>
                      <p>vé giảm 30%: {totalRevenue.totalDiscount30}/30</p>
                      <p>vé giảm 40%: {totalRevenue.totalDiscount40}/40</p>
                      <p>vé giảm 50%: {totalRevenue.totalDiscount50}/50</p>
                    </div>

                    {/* Đường phân cách */}
                    <div className="line"></div>

                    {/* Tổng doanh thu */}
                    <div className="total">
                      <h3>
                        Tổng doanh thu:{" "}
                        {totalRevenue.totalPrice.toLocaleString()} đ
                        {console.log(totalRevenue.totalPrice)}
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
