import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "../img/Phim.png";
import Dropdown from "./Dropdown";
import Login from "../Login/Login.jsx";
import Register from "../Register/Register.jsx";

import jwtDecode from "jwt-decode";
import MovieSearch from "./MovieSearch .jsx";

function Header() {
  const options = ["HCM", "Hà-Nội", "Đà-Nẵng"];
  const events = ["Endows"];
  const movies = ["Phim đang chiếu", "Phim sắp chiếu"];
  const [allMovies, setAllMovies] = useState([]); //
  const [showingM, setShowingM] = useState([]);
  const [upComingM, setUpComingM] = useState([]);

  const handleSelect = (selected) => {
    console.log("Selected option:", selected);
  };

  const [modalType, setModalType] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for logged-in user on component mount
    try {
      const userData = localStorage.getItem("loggedInUser");
      setLoggedInUser(userData ? JSON.parse(userData) : null); // Chỉ cần parse đối tượng, không phải email
    } catch (error) {
      console.error("Error parsing loggedInUser from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch danh sách phim từ API
    fetch("https://cinema-backend-zeta.vercel.app/api/movies/released")
      .then((response) => response.json())
      .then((data) => setAllMovies(Array.isArray(data) ? data : [])) // Xử lý dữ liệu không hợp lệ
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setAllMovies([]);
      });
  }, []);

  const handleLoginClick = () => {
    setModalType("login");
  };

  const handleRegisterClick = () => {
    setModalType("register");
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleLoginSuccess = (userData) => {
    // Save user data to localStorage
    localStorage.setItem("loggedInUser", JSON.stringify(userData));

    // Delay updating the state until after the modal closes
    setTimeout(() => {
      setLoggedInUser(userData);

      // Close the modal after 3 seconds
      setTimeout(() => {
        setModalType(null);
      }, 3000);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    navigate("/");
  };

  const getDisplayName = () => {
    if (!loggedInUser || !loggedInUser.fullName) return ""; // Không có user
    const parts = loggedInUser.fullName.trim().split(" ");
    return parts.length > 1 ? parts[parts.length - 1] : parts[0]; // Lấy từ cuối hoặc nguyên tên
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/movie/top_rating"
        ); // URL API của bạn
        setShowingM(response.data); // Lưu danh sách phim vào state
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchMovies0 = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/movies/not_released"
        ); // URL API của bạn
        setUpComingM(response.data); // Lưu danh sách phim vào state
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies0();
  }, []);
  const handleClick = (id) => {
    navigate(`/DetailMovie/${id}`);
  };
  return (
    <div className="flex font-nunito justify-around w-[100%] items-center h-fit border-b-8 border-gray-200 pb-2 pt-2">
      <Link to={"/"} className="w-fit h-20">
        <img className="w-28 h-[100%]" src={logo} alt="logo" />
      </Link>

      <div className=" flex justify-between gap-4 items-center h-fit text-gray-600 ">
        <div className="self-center text-center h-fit">
          <Dropdown
            options={options}
            placeholder="Rạp Chiếu"
            onSelect={handleSelect}
            herf="rap-phim"
          />
        </div>
        <div className="text-nowrap">
          <Dropdown
            options={events}
            placeholder="Khuyến Mãi"
            onSelect={handleSelect}
            herf="uu-dai"
          />
        </div>

        <div className="relative inline-block group">
          <button className="text-gray-600 text-xl py-2 px-4 rounded-lg">
            Phim
          </button>

          {/* Dropdown Menu */}
          <div className="absolute hidden group-hover:block bg-gray-50 shadow-xl rounded-lg py-2 px-3 w-max z-10">
            <div className="h-fit">
              <p className="border-l-4 pl-2 text-lg border-blue-700 font-normal">
                Phim Đang Chiếu
              </p>
              <ul className="flex justify-between gap-4 items-center">
                {showingM.slice(0, 4).map((movie) => (
                  <li
                    onClick={() => handleClick(movie._id)}
                    key={movie._id}
                    className="w-36 h-64 relative group rounded-lg overflow-hidden"
                  >
                    {/* Hình ảnh */}
                    <img
                      className="w-36 h-48 bg-black rounded-lg object-cover"
                      src={movie.img}
                      alt={movie.title}
                    />

                    {/* Nút "Mua vé" */}

                    {/* Tên phim */}
                    <p className="text-center mt-2">{movie.title}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="border-l-4 pl-2 text-lg border-blue-700 font-normal mt-3">
                Phim Sắp chiếu
              </p>
              <ul className="flex justify-between gap-4 items-center">
                {upComingM.slice(0, 4).map((movie) => (
                  <li key={movie._id} className="w-36 h-fit">
                    <img
                      className="w-36 h-48 rounded-lg bg-black"
                      src={movie.img}
                      alt={movie.title}
                    />
                    <p className="h-fit">{movie.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="hover:text-orange-500">
          <Link to={"/"}>Mua vé</Link>
        </p>

        <a className="hover:text-orange-500 pl-3" href="/Blog-movies">
          Blog Mê phim
        </a>
      </div>
      <div>
        <MovieSearch
          movies={allMovies}
          onSearch={(term) => console.log("Tìm kiếm:", term)}
        />
      </div>

      <div className="">
        {loggedInUser ? (
          <div className="flex gap-3 justify-center items-center ">
            <Link to="/Profile">Hello, {getDisplayName()}</Link>
            <button onClick={handleLogout} className="">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={handleLoginClick}>Đăng nhập</button>
        )}
        {modalType === "login" && (
          <Login
            isOpen={modalType === "login"}
            onClose={handleCloseModal}
            onRegisterClick={handleRegisterClick}
            onLoginSuccess={handleLoginSuccess} // Pass success handler
          />
        )}
        {modalType === "register" && (
          <Register
            isOpen={modalType === "register"}
            onClose={handleCloseModal}
            onLoginClick={handleLoginClick}
          />
        )}
      </div>
    </div>
  );
}

export default Header;
