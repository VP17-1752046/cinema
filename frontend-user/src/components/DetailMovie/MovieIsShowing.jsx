import React, { useState, useEffect } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const MovieIsShowing = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/movie/top_rating`
        );
        setMovies(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMovie();
  }, []);
  const handleClick = (id) => {
    navigate(`/DetailMovie/${id}`);
  };

  return (
    <div className="font-nunito grid items-end space-y-5 w-fit  h-fit  ">
      <p className="border-l-4 border-blue-800 pl-2 font-semibold text-xl text-gray-700 w-fit ">
        PHIM ĐANG CHIẾU
      </p>
      {movies.slice(0, 3).map((movie) => (
        <div key={movie._id} className="w-fit">
          <div className="relative group overflow-clip">
            <img
              className="rounded-lg w-[340px] h-60  object-fill
                         "
              src={movie.img}
              alt={movie.title}
            />
            <button
              onClick={() => handleClick(movie._id)}
              className="absolute top-[40%] left-[40%]
                         bg-opacity-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100
                        bg-orange-600 flex p-2 text-white font-medium rounded-lg"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
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
                  d="M18.5 12A2.5 2.5 0 0 1 21 9.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2.5a2.5 2.5 0 0 1 0 5V17a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1-2.5-2.5Z"
                />
              </svg>
              Mua vé
            </button>
          </div>

          <p className="text-base font-semibold text-gray-700 mt-3 w-fit">
            {movie.title}
          </p>
        </div>
      ))}

      <button className="text-orange-600 text-sm rounded-md py-2 px-8 border border-orange-600 w-fit">
        Xem Thêm ❯
      </button>
    </div>
  );
};
export default MovieIsShowing;
