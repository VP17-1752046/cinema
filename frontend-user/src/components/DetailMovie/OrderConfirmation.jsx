import React, { useState, useEffect } from "react";

const OrderConfirmation = ({
  selectedSeats,
  selectedFoods,
  cinemaName,
  roomName,
  title,
  type,
  img,
  times,
  formattedDate,
  onFinalPriceUpdate,
  setSelectedDiscount,
}) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const totalSeatPrice = selectedSeats.reduce(
    (sum, seat) => sum + (seat.typeSeat === "vip" ? 150000 : 100000),
    0
  );

  const totalFoodPrice = selectedFoods.reduce(
    (sum, food) => sum + food.price * food.quantity,
    0
  );

  const totalPrice = totalSeatPrice + totalFoodPrice;
  const finalPrice =
    totalPrice - (discount >= 1 ? (totalPrice * discount) / 100 : discount); // Nếu `discount` là tỷ lệ phần trăm

  useEffect(() => {
    if (onFinalPriceUpdate) {
      onFinalPriceUpdate(finalPrice);
    }
  }, [finalPrice, onFinalPriceUpdate]);

  const handleVoucherCheck = async () => {
    if (!voucherCode.trim()) {
      setVoucherMessage("Vui lòng nhập mã voucher hoặc bỏ qua.");
      return;
    }

    try {
      const response = await fetch(
        "https://cinema-backend-zeta.vercel.app/api/momo/getVoucherByCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: voucherCode }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.promotion && data.promotion.discountPercentage) {
        setDiscount(data.promotion.discountPercentage || 0); // Áp dụng giảm giá
        setVoucherMessage("Mã giảm giá hợp lệ!");

        setSelectedDiscount({ discountId: data.promotion._id });
      } else {
        setDiscount(0); // Không áp dụng giảm giá
        setVoucherMessage("Mã giảm giá không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra voucher:", error);
      setVoucherMessage("Đã xảy ra lỗi khi kiểm tra mã giảm giá.");
    }
  };

  return (
    <div className="font-nunito">
      <p className="text-2xl  flex justify-center font-bold text-blue-600">
        Xác nhận đơn hàng
      </p>
      <div className="bg-white w-full p-4">
        <div className=" pb-4">
          <div className="flex justify-center gap-10 w-auto">
            <img className="w-1/3  mr-3" src={img} alt={title} />
            <div className="">
              <p className="font-bold text-lg">{title}</p>
              <p className=" text-base">
                2D phụ đề -{" "}
                <span className="bg-orange-600 text-white font-bold rounded-sm p-[3px]">
                  {type}
                </span>
              </p>
              <p className="flex font-bold">
                {cinemaName} - <span className="font-normal">{roomName}</span>
              </p>
              <p>
                Suất: <span className="font-bold">{times}</span> -{" "}
                {formattedDate}
              </p>
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
              <div className="flex">
                <svg
                  class="w-8 h-8 text-gray-800 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.891 15.107 15.11 8.89m-5.183-.52h.01m3.089 7.254h.01M14.08 3.902a2.849 2.849 0 0 0 2.176.902 2.845 2.845 0 0 1 2.94 2.94 2.849 2.849 0 0 0 .901 2.176 2.847 2.847 0 0 1 0 4.16 2.848 2.848 0 0 0-.901 2.175 2.843 2.843 0 0 1-2.94 2.94 2.848 2.848 0 0 0-2.176.902 2.847 2.847 0 0 1-4.16 0 2.85 2.85 0 0 0-2.176-.902 2.845 2.845 0 0 1-2.94-2.94 2.848 2.848 0 0 0-.901-2.176 2.848 2.848 0 0 1 0-4.16 2.849 2.849 0 0 0 .901-2.176 2.845 2.845 0 0 1 2.941-2.94 2.849 2.849 0 0 0 2.176-.901 2.847 2.847 0 0 1 4.159 0Z"
                  />
                </svg>
                <div className="promotion flex w-fit relative">
                  <input
                    className="w-60 focus: outline-none focus:border-b-[2px] focus:border-gray-400"
                    type="text"
                    placeholder="(nhập mã khuyến mãi nếu có)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />

                  <svg
                    onClick={handleVoucherCheck}
                    className="absolute bottom-0 right-0 w-6 h-6 text-gray-800 hover:text-green-600 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 11.917 9.724 16.5 19 7.5"
                    />
                  </svg>
                </div>
              </div>
              {/* Thông báo kết quả kiểm tra */}
              {voucherMessage && (
                <p className="text-sm text-red-600 mt-2">{voucherMessage}</p>
              )}

              <div className="border-dashed border-t-2 border-gray-600 mt-4 pt-2 flex justify-between font-bold">
                <p className="">Tổng Cộng</p>
                <p className="text-orange-600">
                  {finalPrice.toLocaleString()} đ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderConfirmation;
