import React, { useEffect, useState } from "react";
import "./DetailMovie.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Moana from "../img/moanatrailer.png"; // Tạm thời sử dụng ảnh này
import PickingSeat from "./PickSeat";
import { useParams } from "react-router-dom";
import FoodOptios from "./FoodOptions";
import OrderConfirmation from "./OrderConfirmation";

const Booking = () => {
  const { id } = useParams();
  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null); // State để lưu mã giảm giá được chọn
  const [selectedSeats, setSelectedSeats] = useState([]); // State lưu ghế đã chọn
  const [selectedFoods, setSelectedFoods] = useState([]); // Danh sách món ăn đã chọn
  const [showAlert, setShowAlert] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0); //State để lưu giá cuối cùng dùng để thanh toán
  const [step, setStep] = useState(1); // Quản lý trạng thái bước
  useEffect(() => {
    const fetchShowtimeData = async () => {
      try {
        const response = await fetch(
          `https://cinema-backend-zeta.vercel.app/api/showtimes/${id}`
        );
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
    return (
      <div class="flex items-center justify-center w-auto rounded-lg ">
        <div role="status" class="flex justify-center">
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    ); // Loading state
  }
  const handleNextStep = () => {
    if (step === 1 && selectedSeats.length === 0) {
      setShowAlert(true); // Hiển thị thông báo nếu chưa chọn ghế
      setTimeout(() => setShowAlert(false), 3000); // Ẩn thông báo sau 3 giây
      return;
    }

    // Tăng bước nếu điều kiện hợp lệ
    setStep((prevStep) => prevStep + 1);
  };
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
  };

  const { movie, room, times, cinema, days } = showtimeData;
  const { title, img, type } = movie || {};
  const cinemaName = cinema ? cinema.cinemaName : "Không có thông tin rạp";
  const roomName = room ? room.roomName : "Không có thông tin phòng";

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", options); // Hiển thị theo định dạng ngày Việt Nam
  };

  const formattedDate = days ? formatDate(days) : "Không có thông tin ngày";

  const handlePayment = async () => {
    const amount = finalPrice;
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
      console.error("Người dùng chưa đăng nhập.");
      return;
    }

    const user = JSON.parse(userData);
    const userId = user._id;

    try {
      const response = await fetch(
        "https://cinema-backend-zeta.vercel.app/api/momo/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            userId,
            selectedSeats,
            showtimeId: id,
            selectedFoods,
            discountId: selectedDiscount?.discountId || null,
          }), // Truyền TT vào request
        }
      );

      const data = await response.json();

      if (data && data.payUrl) {
        if (data.token) {
          // Lưu token vào localStorage
          localStorage.setItem("paymentToken", data.token);
          console.log("Token thanh toán đã được lưu:", data.token);
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
      <div className="bg-gray-200 h-auto z-0">
        <div className="stepper w-full mt-2 mb-3 bg-white h-fit py-4 items-center">
          <ul className="flex justify-center items-center text-gray-500">
            <li className="pr-4 pb-5 border-b-2  border-gray-300 text-gray-500 text-base font-nunito font-bold">
              Chọn phim/ Rạp/ Suất
            </li>
            <li
              className={`pr-4 pb-5 ${
                step === 1
                  ? "border-b-2 border-blue-800 text-blue-600"
                  : "border-b-2 border-gray-300 text-gray-500"
              } text-base font-nunito font-bold`}
            >
              Chọn ghế
            </li>
            <li
              className={`pr-4 pb-5 ${
                step === 2
                  ? "border-b-2 border-blue-800 text-blue-600"
                  : "border-b-2 border-gray-300 text-gray-500"
              } text-base font-nunito font-bold`}
            >
              Chọn thức ăn
            </li>
            <li
              className={`pr-4 pb-5 ${
                step === 3
                  ? "border-b-2 border-blue-800 text-blue-600"
                  : "border-b-2 border-gray-300 text-gray-500"
              } text-base font-nunito font-bold`}
            >
              Xác nhận
            </li>
            <li className="stepper">Thanh toán</li>
          </ul>
        </div>
        <div>
          {showAlert && (
            <div
              className="fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 mr-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="font-medium">Thông báo:</span> Bạn vui lòng chọn
              ghế để tiếp tục.
            </div>
          )}
        </div>

        <div className="mt-1 flex justify-around w-full">
          <div className="picking h-fit w-[65%] bg-white rounded-lg py-8 px-10 mb-10">
            {step === 1 && (
              <PickingSeat
                onSeatSelect={handleSeatSelect}
                selectedSeats={selectedSeats}
              />
            )}
            {step === 2 && (
              <FoodOptios
                onFoodSelect={(id, name, price, quantity) => {
                  const parsedPrice = parseFloat(price) || 0;
                  const parsedQuantity = parseInt(quantity, 10) || 0;
                  setSelectedFoods((prevFoods) => {
                    const existingFood = prevFoods.find(
                      (food) => food.id === id
                    );

                    if (parsedQuantity === 0) {
                      // Nếu số lượng là 0, xóa món ăn khỏi danh sách
                      return prevFoods.filter((food) => food.id !== id);
                    }

                    if (existingFood) {
                      // Nếu món ăn đã tồn tại, cập nhật số lượng
                      return prevFoods.map((food) =>
                        food.id === id
                          ? { ...food, quantity: parsedQuantity }
                          : food
                      );
                    }

                    // Thêm món ăn mới vào danh sách
                    return [
                      ...prevFoods,
                      {
                        id,
                        name,
                        price: parsedPrice,
                        quantity: parsedQuantity,
                      },
                    ];
                  });
                }}
              />
            )}
            {step === 3 && (
              <OrderConfirmation
                setSelectedDiscount={setSelectedDiscount}
                selectedSeats={selectedSeats}
                selectedFoods={selectedFoods}
                cinemaName={cinemaName}
                roomName={roomName}
                title={title}
                type={type}
                img={img}
                times={times}
                formattedDate={formattedDate}
                onFinalPriceUpdate={(price) => setFinalPrice(price)}
              />
            )}
          </div>
          <div className="mb-5 cardPrice h-fit w-[28%] font-nunito rounded-lg border-t-4 border-orange-600 float-right">
            <div className="bg-white w-full p-4">
              <div className="border-dashed border-b-[1px] border-black pb-4">
                <div className="flex flex-start w-fit">
                  <img
                    className="w-32 h-44 object-cover mr-3"
                    src={img || Moana}
                    alt={title}
                  />
                  <div>
                    <p className="font-bold text-lg">{title}</p>
                    <p className="mt-4 text-base">
                      2D phụ đề -{" "}
                      <span className="bg-orange-600 text-white font-bold rounded-sm p-[3px]">
                        {type}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="flex font-bold">
                    {cinemaName} -{" "}
                    <span className="font-normal">{roomName}</span>
                  </p>
                  <p>
                    Suất: <span className="font-bold">{times}</span> -{" "}
                    {formattedDate}
                  </p>
                </div>
                {selectedSeats.map((seat, index) => (
                  <div className="total flex justify-between font-medium text-base text-gray-500">
                    <p>{seat.number}</p>
                    <p>{seat.typeSeat === "vip" ? "150.000 đ" : "100.000 đ"}</p>
                  </div>
                ))}
                {selectedFoods.map((food, index) => (
                  <div
                    key={index}
                    className="total flex justify-between items-center font-medium text-base text-gray-500 "
                  >
                    <p className="">
                      {food.name} x {food.quantity}
                    </p>
                    <p className="text-nowrap">
                      {(food.price * food.quantity).toLocaleString()} đ
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 font-bold">
                <p className="">Tổng Cộng</p>
                <p className="text-orange-600">
                  {(
                    selectedSeats.reduce(
                      (sum, seat) =>
                        sum + (seat.typeSeat === "vip" ? 150000 : 100000),
                      0
                    ) +
                    selectedFoods.reduce(
                      (sum, food) => sum + food.price * food.quantity,
                      0
                    )
                  ).toLocaleString()}{" "}
                  đ
                </p>
              </div>
            </div>
            <div className="flex justify-around mt-7">
              <button
                className="bg-white font-bold rounded-lg w-32 py-1 text-orange-600 hover:bg-orange-600 hover:text-white"
                onClick={() => setStep(1)}
              >
                Quay lại
              </button>
              {step < 3 && (
                <button
                  className="bg-white font-bold rounded-lg w-32 py-1 text-orange-600 hover:bg-orange-600 hover:text-white"
                  onClick={handleNextStep}
                >
                  Tiếp tục
                </button>
              )}
              {step === 3 && (
                <button
                  className="bg-white font-bold rounded-lg w-32 py-1 text-orange-600 hover:bg-orange-600 hover:text-white"
                  onClick={handlePayment}
                >
                  Thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Booking;
