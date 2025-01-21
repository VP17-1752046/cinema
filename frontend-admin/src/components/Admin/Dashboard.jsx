import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import Sidebar from "./SideBar";
import "./Admin.css";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [movieRevenueData, setMovieRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocationMonth, setSelectedLocationMonth] = useState("all");
  const [selectedMovieMonth, setSelectedMovieMonth] = useState("all");
  const [bookingsData, setBookingsData] = useState([]);
  const [cinemaLocations, setCinemaLocations] = useState({});
  const [movieTitles, setMovieTitles] = useState({});

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const processRevenueData = (
    bookings,
    cinemaLocs,
    movieTits,
    locationMonth,
    movieMonth
  ) => {
    const revenueByLocation = {};
    const revenueByTitleMovie = {};

    bookings.forEach((booking) => {
      if (
        booking.showtimeId &&
        booking.showtimeId.cinema &&
        booking.showtimeId.movie &&
        booking.totalPrice
      ) {
        const bookingDate = new Date(booking.createdAt);
        const bookingMonth = bookingDate.getMonth() + 1;

        // Process location revenue
        if (
          locationMonth === "all" ||
          bookingMonth === parseInt(locationMonth)
        ) {
          const cinemaId =
            booking.showtimeId.cinema._id || booking.showtimeId.cinema;
          const location = cinemaLocs[cinemaId];
          if (location) {
            revenueByLocation[location] =
              (revenueByLocation[location] || 0) + booking.totalPrice;
          }
        }

        // Process movie revenue
        if (movieMonth === "all" || bookingMonth === parseInt(movieMonth)) {
          const movieID =
            booking.showtimeId.movie._id || booking.showtimeId.movie;
          const title = movieTits[movieID];
          if (title) {
            revenueByTitleMovie[title] =
              (revenueByTitleMovie[title] || 0) + booking.totalPrice;
          }
        }
      }
    });

    setRevenueData(
      Object.entries(revenueByLocation).map(([location, value]) => ({
        location,
        value,
      }))
    );

    setMovieRevenueData(
      Object.entries(revenueByTitleMovie).map(([title, value]) => ({
        title,
        value,
      }))
    );
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [moviesRes, usersRes, bookingsRes, cinemasRes] =
          await Promise.all([
            axios.get("https://cinema-backend-zeta.vercel.app/api/movies/"),
            axios.get("https://cinema-backend-zeta.vercel.app/api/users/"),
            axios.get("https://cinema-backend-zeta.vercel.app/api/booking/"),
            axios.get("https://cinema-backend-zeta.vercel.app/api/cinemas/"),
          ]);

        setMovies(moviesRes.data);
        setUsers(usersRes.data);
        setBookingsData(bookingsRes.data);

        // Create maps for cinema locations and movie titles
        const locations = {};
        cinemasRes.data.forEach((cinema) => {
          locations[cinema._id] = cinema.location;
        });
        setCinemaLocations(locations);

        const titles = {};
        moviesRes.data.forEach((movie) => {
          titles[movie._id] = movie.title;
        });
        setMovieTitles(titles);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Initial data fetch only

  useEffect(() => {
    if (
      bookingsData.length > 0 &&
      Object.keys(cinemaLocations).length > 0 &&
      Object.keys(movieTitles).length > 0
    ) {
      processRevenueData(
        bookingsData,
        cinemaLocations,
        movieTitles,
        selectedLocationMonth,
        selectedMovieMonth
      );
    }
  }, [
    bookingsData,
    cinemaLocations,
    movieTitles,
    selectedLocationMonth,
    selectedMovieMonth,
  ]);

  const handleLocationMonthChange = (e) => {
    setSelectedLocationMonth(e.target.value);
  };

  const handleMovieMonthChange = (e) => {
    setSelectedMovieMonth(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="container">
        <Sidebar />
        <main className="main">
          <h1 className="title">Loading...</h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Sidebar />
        <main className="main">
          <h1 className="title">Error: {error}</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <Sidebar />
      <main className="main">
        <h1 className="title">Dashboard</h1>
        <div className="stats">
          <div className="stat">
            <i className="fas fa-film icon"></i>
            <div>
              <p>Total Movies</p>
              <p className="stat-number">{movies.length}</p>
            </div>
          </div>
          <div className="stat">
            <i className="fas fa-user icon"></i>
            <div>
              <p>Total Users</p>
              <p className="stat-number">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap direction">
          <div className="chart">
            <div className="chart-section" style={{ height: "400px" }}>
              <div className="flex justify-between items-center mb-4 chartComboBox">
                <h2 className="chart-title">Revenue by Location</h2>
                <div className="all-combobox">
                  <span>Month: </span>
                  <select
                    value={selectedLocationMonth}
                    onChange={handleLocationMonthChange}
                    className="p-2 border rounded"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      dataKey="value"
                      nameKey="location"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ location, value }) =>
                        `${location}: ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)}`
                      }
                    >
                      {revenueData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="noti-norevenue">No revenue data available</p>
              )}
            </div>
          </div>

          <div className="chart">
            <div className="chart-section" style={{ height: "400px" }}>
              <div className="flex justify-between items-center mb-4 chartComboBox">
                <h2 className="chart-title">Revenue by Movie</h2>
                <div className="all-combobox">
                  <span>Month: </span>
                  <select
                    value={selectedMovieMonth}
                    onChange={handleMovieMonthChange}
                    className="p-2 border rounded"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {movieRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={movieRevenueData}
                      dataKey="value"
                      nameKey="title"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ title, value }) =>
                        `${title}: ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)}`
                      }
                    >
                      {movieRevenueData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="noti-norevenue">
                  No movie revenue data available
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
