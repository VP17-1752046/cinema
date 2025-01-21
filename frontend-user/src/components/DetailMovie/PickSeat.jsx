import React, { useEffect, useState } from "react";
import "./DetailMovie.css";
import axios from "axios";
import Screen from "../img/seatMapHeader.png";
import { useParams } from "react-router-dom";

const PickingSeat = ({ onSeatSelect, selectedSeats }) => {
  const { id } = useParams();
  console.log(id);
  const [layout, setLayout] = useState();
  useEffect(() => {
    // Gọi API để lấy dữ liệu layout
    axios
      .get(`https://cinema-backend-zeta.vercel.app/api/movie/seats/${id}`)
      .then((response) => {
        setLayout(response.data);
      })
      .catch((error) => {
        console.error("Error fetching seat layout:", error);
      });
  }, [id]); // Khi showtimeId thay đổi, gọi lại API
  if (!layout) {
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
    );
  }
  return (
    <div className="font-nunito">
      <div className="flex items-center mb-12">
        {" "}
        <img className=" " src={Screen} alt="" />
      </div>
      <div className="font-medium flex justify-around mb-10">
        <p className="flex  items-center">
          <span className="border px-2 mr-2">A1</span> <p>Ghế có thể đặt</p>
        </p>
        <p className="flex  items-center">
          <span className="border px-2 mr-2 border-red-700">A1</span>{" "}
          <p>Ghế Vip</p>
        </p>
        <p className="flex  items-center">
          <span className="border px-2 mr-2 bg-red-500 text-white">A1</span>{" "}
          <p>Ghế đã được đặt</p>
        </p>
        <p className="flex  items-center">
          <span className="border px-2 mr-2 bg-green-600 text-white">A1</span>{" "}
          <p>Ghế đang chọn</p>
        </p>
        <p className="flex  items-center">
          <span className="border px-2 mr-2 bg-pink-200 text-white">A1</span>{" "}
          <p>Ghế đôi</p>
        </p>
      </div>
      <div>
        {layout.seat.map((row, index) => (
          <div className="seatLayout" key={index}>
            <h2>{row.row}</h2>
            <ul className="flex items-center justify-between gap-2">
              {row.seats.map((seat, seatIndex) => {
                const isSelected = selectedSeats.some(
                  (s) => s.number === seat.number
                );
                const isBooked = seat.status === "booked";
                return (
                  <li
                    key={seatIndex}
                    onClick={() => !isBooked && onSeatSelect(seat)} // Xử lý chọn ghế
                    className={`py-1 border text-sm w-9 text-center cursor-pointer
                                         ${
                                           seat.typeSeat === "vip"
                                             ? "border-red-700"
                                             : ""
                                         }
                                         ${
                                           seat.typeSeat === "couple"
                                             ? "bg-pink-200"
                                             : ""
                                         } 
                                         ${
                                           isSelected
                                             ? "bg-green-600 text-white"
                                             : ""
                                         }
                                         ${
                                           isBooked
                                             ? "bg-red-500 text-white"
                                             : ""
                                         }`} // Đổi màu nếu được chọn
                  >
                    {seat.number}
                  </li>
                );
              })}
            </ul>
            <h2>{row.row}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PickingSeat;
