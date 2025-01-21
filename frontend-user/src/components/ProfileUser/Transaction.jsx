import axios from "axios";
import React, { useState, useEffect } from "react";
import Ticket from "./Ticket";
import { useLocation } from "react-router-dom";
const Transaction = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null); // Dữ liệu vé được chọn
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const userData = localStorage.getItem("loggedInUser");
  const user = JSON.parse(userData);
  const userId = user._id;
  console.log("day a user", userId);
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const userData = localStorage.getItem("loggedInUser");
        const user = JSON.parse(userData);
        const userId = user._id;
        console.log("day a user", userId);
        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/users/transaction-history`,
          { params: { userId, page: currentPage } }
        );
        setBookings(response.data.bookings);
        setTotalPages(response.data.totalPages);
      } catch {
        console.log("error feching bookings");
      }
    };
    fetchBooking();
  }, [userId, currentPage]);

  useEffect(() => {
    // Kiểm tra nếu URL có tham số ticketCode
    const queryParams = new URLSearchParams(location.search);
    const ticketCode = queryParams.get("ticketCode");

    if (ticketCode) {
      // Tìm booking tương ứng với ticketCode và mở modal
      const booking = bookings.find((b) => b.ticketCode === ticketCode);
      if (booking) {
        setSelectedBooking(booking);
        setIsModalOpen(true);
      }
    }
  }, [location.search, bookings]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = (booking) => {
    setSelectedBooking(booking); // Lưu dữ liệu vé được chọn
    setIsModalOpen(true); // Mở modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null); // Xóa dữ liệu vé khi đóng modal
  };

  return (
    <>
      <div className="my-10 mx-9">
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs  uppercase bg-gray-500  text-white">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Phim
                </th>
                <th scope="col" class="px-6 py-3">
                  Mã lấy vé
                </th>
                <th scope="col" class="px-6 py-3">
                  Thông tin vé
                </th>
                <th scope="col" class="px-6 py-3">
                  Tổng tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(booking)}
                    className="odd:bg-white  even:bg-gray-300 text-black cursor-pointer hover:border  hover:border-black  "
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {booking.showtime?.movieTitle || "N/A"}
                    </td>
                    <td className="px-6 py-4">{booking.ticketCode}</td>
                    <td className="px-6 py-4">
                      {`Ghế: ${booking.seats} | Suất chiếu: ${
                        booking.showtime?.time || "N/A"
                      } | Ngày: ${booking.showtime?.day || "N/A"}`}
                    </td>
                    <td className="px-6 py-4">
                      {booking.totalPrice.toLocaleString()} VNĐ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    Không có giao dịch nào
                  </td>
                </tr>
              )}
              <div className=" my-4 flex justify-center items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-6 py-2 mx-2 text-white  rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-gray-800 "
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
                      d="m15 19-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className=" py-2 text-gray-700 font-semibold">
                  {`Trang ${currentPage} / ${totalPages}`}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-6 py-2 mx-2 text-white  focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-gray-800 "
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
                      d="m9 5 7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </tbody>
          </table>
          {/* Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={closeModal} // Đóng modal khi nhấn ra ngoài
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
                onClick={(e) => e.stopPropagation()} // Ngăn sự kiện đóng modal khi nhấn vào nội dung bên trong
              >
                <button
                  className="absolute top-2 right-2 text-gray-600"
                  onClick={closeModal}
                >
                  &times;
                </button>
                <Ticket booking={selectedBooking} />{" "}
                {/* Truyền dữ liệu vào Ticket */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Transaction;
