import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideBar";
import "./Admin.css";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [movieOptions, setMovieOptions] = useState([]); // Added
  const [cinemaOptions, setCinemaOptions] = useState([]); // Added
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    movieTitle: "",
    cinema: "",
    bookingDate: "",
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/booking/filter-options"
        );
        setMovieOptions(response.data.movies);
        setCinemaOptions(response.data.cinemas);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          ticketCode: searchQuery,
          movieTitle: filters.movieTitle,
          cinema: filters.cinema,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/booking/all-booking-pagination?${queryParams}`
        );

        setBookings(response.data.bookings);
        setTotalPages(response.data.totalPages);
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to fetch bookings. Please try again.");
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage, searchQuery, filters]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      handleCloseModal();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to page 1
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      movieTitle: "",
      cinema: "",
      bookingDate: "",
    });
    setSearchQuery("");
    setCurrentPage(1); // Reset to page 1
  };

  const filteredBookings = bookings;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return value ? value.toLocaleString("vi-VN") : "0";
  };

  // Get unique movie titles and cinemas for filter options
  // const movieTitles = [
  //   ...new Set(bookings.map((b) => b.showtimeId.movie.title)),
  // ];
  // const cinemas = [
  //   ...new Set(bookings.map((b) => b.showtimeId.cinema.cinemaName)),
  // ];

  return (
    <div className="container">
      <Sidebar />
      <main className="main">
        <h2 className="subtitle">Booking</h2>
        <div className="filters-section">
          <h3>Search & Filter Booking</h3>
          <div className="filters-grid">
            <div className="filter-item">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã vé..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="filter-item">
              <select
                name="movieTitle"
                value={filters.movieTitle}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tất cả phim</option>
                {movieOptions.map((title, index) => (
                  <option key={index} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select
                name="cinema"
                value={filters.cinema}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tất cả rạp</option>
                {cinemaOptions.map((cinema, index) => (
                  <option key={index} value={cinema}>
                    {cinema}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range filters */}
            <div className="filter-item">
              <input
                type={filters.startDate ? "date" : "text"}
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-date"
                placeholder="Từ ngày"
                onFocus={(e) => (e.target.type = "date")}
              />
            </div>
            <div className="filter-item">
              <input
                type={filters.endDate ? "date" : "text"}
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-date"
                placeholder="Đến ngày"
                onFocus={(e) => (e.target.type = "date")}
              />
            </div>

            {/* Clear filters button */}
            <div className="filter-item">
              <button onClick={clearFilters} className="clear-filters-btn">
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="results-count">
            {filteredBookings.length} kết quả{" "}
            {(searchQuery || Object.values(filters).some((v) => v)) &&
              "cho bộ lọc hiện tại"}
          </div>
        )}

        {/* Rest of your existing JSX remains the same */}
        {isLoading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <div className="table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Mã vé</th>
                    <th>Mã đơn hàng</th>
                    <th>Phim</th>
                    <th>Rạp</th>
                    <th>Giờ chiếu</th>
                    <th>Ngày chiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        onClick={() => handleBookingClick(booking)}
                        className="booking-row"
                      >
                        <td>{booking.ticketCode}</td>
                        <td>{booking.orderId || "N/A"}</td>
                        <td>{booking.showtimeId.movie.title}</td>
                        <td>{booking.showtimeId.cinema.cinemaName}</td>
                        <td>{booking.showtimeId.times}</td>
                        <td>{formatDate(booking.showtimeId.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        Không tìm thấy kết quả nào cho bộ lọc hiện tại
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add pagination controls */}
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m15 19-7-7 7-7"
                  />
                </svg>
              </button>

              <span>
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
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

            {/* Modal */}
            {selectedBooking && (
              <div className="modal-overlay" onClick={handleOverlayClick}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Chi tiết đặt vé</h3>
                    <button className="close-button" onClick={handleCloseModal}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    {/* Thông tin vé */}
                    <div className="detail-section">
                      <h4 className="section-title">Thông tin vé</h4>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Mã vé:</strong>
                          <span>{selectedBooking.ticketCode}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Mã đơn hàng:</strong>
                          <span>{selectedBooking.orderId || "N/A"}</span>
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Ghế đã chọn:</strong>
                          <div className="seats-container">
                            {selectedBooking.seat.map((seat, index) => (
                              <span key={index} className="seat-tag">
                                {seat.number} ({seat.typeSeat})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {selectedBooking.foodNames &&
                        selectedBooking.foodNames.length > 0 && (
                          <div className="detail-row">
                            <div className="detail-item">
                              <strong>Đồ ăn & Thức uống:</strong>
                              <div className="food-container">
                                {selectedBooking.foodNames.map(
                                  (food, index) => (
                                    <div key={index} className="food-item">
                                      <span>{food.name || "N/A"}</span>
                                      <span>x{food.quantity || 0}</span>
                                      <span>
                                        {food.price
                                          ? `${formatCurrency(food.price)}đ`
                                          : "0đ"}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Tổng tiền ghế:</strong>
                          <span>
                            {formatCurrency(selectedBooking.totalSeatPrice)}đ
                          </span>
                        </div>
                        {selectedBooking.totalFoodPrice > 0 && (
                          <div className="detail-item">
                            <strong>Tổng tiền đồ ăn:</strong>
                            <span>
                              {formatCurrency(selectedBooking.totalFoodPrice)}đ
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Tổng tiền:</strong>
                          <span>
                            {formatCurrency(selectedBooking.totalPrice)}đ
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>Thời gian đặt:</strong>
                          <span>
                            {new Date(selectedBooking.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin phim và rạp */}
                    <div className="detail-section">
                      <h4 className="section-title">Thông tin suất chiếu</h4>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Tên phim:</strong>
                          <span>
                            {selectedBooking.showtimeId.movie.title || "N/A"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>Rạp:</strong>
                          <span>
                            {selectedBooking.showtimeId.cinema.cinemaName ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Phòng chiếu:</strong>
                          <span>
                            {selectedBooking.showtimeId.room.roomName || "N/A"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>Giờ chiếu:</strong>
                          <span>
                            {selectedBooking.showtimeId.times || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Ngày chiếu:</strong>
                          <span>
                            {selectedBooking.showtimeId.date
                              ? formatDate(selectedBooking.showtimeId.date)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin người đặt */}
                    <div className="detail-section">
                      <h4 className="section-title">Thông tin người đặt</h4>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Tên người đặt:</strong>
                          <span>
                            {selectedBooking.userId.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>Email:</strong>
                          <span>{selectedBooking.userId.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Booking;
