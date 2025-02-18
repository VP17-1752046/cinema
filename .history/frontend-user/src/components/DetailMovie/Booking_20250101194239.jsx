import React, { useEffect, useState } from "react";
import "./DetailMovie.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Moana from "../img/moanatrailer.png"; // Tạm thời sử dụng ảnh này
import PickingSeat from "./PickSeat";
import { useParams } from "react-router-dom";

const Booking = () => {
  const { id } = useParams(); // Nhận ID suất chiếu từ URL
  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // State lưu ghế đã chọn
  useEffect(() => {
    const fetchShowtimeData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/showtimes/${id}`);
        const data = await response.json();
        setShowtimeData(data); // Giả sử API trả về đối tượng suất chiếu
      } catch (error) {
        console.error("Error fetching showtime data:", error);
      }

    };

    if (id) {
      fetchShowtimeData();
    }
  }, [id]);

  if (!showtimeData) {
    return <div>Loading...</div>; // Loading state
  }
  const handleSeatSelect = (seat) => {
    setSelectedSeats((prevSeats) => {
      // Kiểm tra ghế đã được chọn chưa
      const isAlreadySelected = prevSeats.some((s) => s.number === seat.number);

      if (isAlreadySelected) {
        // Nếu đã chọn, loại bỏ ghế
        return prevSeats.filter((s) => s.number !== seat.number);
      } else {
        // Nếu chưa chọn, thêm ghế vào danh sách
        return [...prevSeats, seat];
      }
    });
  }

  const { movie, room, times, cinema, days } = showtimeData;
  const { title, img, type } = movie || {};
  const cinemaName = cinema ? cinema.cinemaName : "Không có thông tin rạp";
  const roomName = room ? room.roomName : "Không có thông tin phòng";

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", options); // Hiển thị theo định dạng ngày Việt Nam
  };

  const formattedDate = days ? formatDate(days) : "Không có thông tin ngày";



  const handlePayment = async () => {
    const amount = selectedSeats.reduce(
      (sum, seat) => sum + (seat.typeSeat === 'vip' ? 150000 : 100000),
      0
    );

    const userData = localStorage.getItem('loggedInUser');
    if (!userData) {
      console.error('Người dùng chưa đăng nhập.');
      return;
    }

    const user = JSON.parse(userData);
    const userId = user._id;


    try {
      const response = await fetch("http://localhost:5000/api/momo/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, userId, selectedSeats, showtimeId: id }), // Truyền TT vào request
      });

      const data = await response.json();

      if (data && data.payUrl) {
        if (data.token) {
          // Lưu token vào localStorage
          localStorage.setItem('paymentToken', data.token);
          console.log('Token thanh toán đã được lưu:', data.token);
        } else {
          console.error("Không có token thanh toán trong phản hồi.");
        }
        window.location.href = data.payUrl;
      } else {
        console.error("Không nhận được URL thanh toán từ MoMo.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API thanh toán:", error);
    }
  };
  return (
    <>
      <Header />
      <div className="bg-gray-200 h-auto pt-[1px] z-0">
        <div className="stepper w-full mt-3 mb-5 bg-white h-fit py-4 items-center">
          <ul className="flex justify-center items-center">
            <li className="pr-4 pb-5 border-b-2 border-blue-800 text-base text-blue-400 font-nunito font-bold">
              Chọn phim/ Rạp/ Suất
            </li>
            <li className="pr-4 pb-5 border-b-2 border-blue-800 text-base text-blue-600 font-nunito font-bold">
              Chọn ghế
            </li>
            <li className="stepper">Chọn thức ăn</li>
            <li className="stepper">Thanh toán</li>
            <li className="stepper">Xác nhận</li>
          </ul>
        </div>
        <div className="mt-1 flex justify-around w-full">
          <div className="h-fit w-[65%] bg-white rounded-lg py-8 px-10 mb-10">
            <PickingSeat onSeatSelect={handleSeatSelect} selectedSeats={selectedSeats} />
          </div>
          <div className="h-fit w-[25%] font-nunito rounded-lg border-t-4 border-orange-600 float-right">
            <div className="bg-white w-full p-4">
              <div className="border-dashed border-b-[1px] border-black pb-4">
                <div className="flex flex-start w-fit">
                  <img className="w-32 h-44 object-cover mr-3" src={img || Moana} alt={title} />
                  <div>
                    <p className="font-bold text-lg">{title}</p>
                    <p className="mt-4 text-base">
                      2D phụ đề - <span className="bg-orange-600 text-white font-bold rounded-sm p-[3px]">{type}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="flex font-bold">
                    {cinemaName} - <span className="font-normal">{roomName}</span>
                  </p>
                  <p>Suất: <span className="font-bold">{times}</span> - {formattedDate}</p>
                </div>
                {selectedSeats.map((seat, index) => (<div className=' flex justify-between font-medium text-base text-gray-500'>
                  <p>{seat.number}</p>
                  <p>{seat.typeSeat === 'vip' ? '150,000 đ' : '100,000 đ'}</p>

                </div>))}

              </div>
              <div className="flex justify-between pt-4 font-bold">
                <p className="">Tổng Cộng</p>
                <p className="text-orange-600">
                  {selectedSeats
                    .reduce((sum, seat) => sum + (seat.typeSeat === 'vip' ? 150000 : 100000), 0)
                    .toLocaleString()}{' '}
                  đ
                </p>
              </div>
            </div>
            <div className="flex justify-around mt-7">
              <button className="bg-white font-bold rounded-lg w-32 py-1 text-orange-600 hover:bg-orange-600 hover:text-white">
                Quay lại
              </button>
              <button onClick={handlePayment} className="bg-white font-bold rounded-lg w-32 py-1 text-orange-600 hover:bg-orange-600 hover:text-white">
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Booking;