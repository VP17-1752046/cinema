import axios from "axios";
import React, { useState, useEffect } from "react";
import MovieIsShowing from "../DetailMovie/MovieIsShowing";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const BlogMovies = () => {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/movie/blog-movie`
        );
        setBlogs(response.data);
      } catch (error) {
        console.log("error feching bookings");
      }
    };
    fetchBooking();
  });

  return (
    <>
      <Header />
      <div className="mx-[5%] my-8 font-nunito  flex justify-between">
        <div className="w-[60%]">
          <div className="pb-4 mb-10 border-b-2 border-blue-800">
            <h1 className="text-xl border-l-4 border-blue-800 text-gray-700 pl-1 ">
              BLOG ĐIỆN ẢNH
            </h1>
          </div>
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <div key={index} className="flex gap-4 w-[100%] mb-3">
                <img className="w-[35%] rounded" src={blog.img} alt="" />

                <div>
                  <p className="font-semibold text-lg text-gray-700">
                    {blog.title}
                  </p>
                  <button className="flex items-center gap-[2px] px-6 py-[2px] mb-3 rounded text-white text-sm bg-blue-400 ">
                    <svg
                      className="w-4 h-4 text-white "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M15.03 9.684h3.965c.322 0 .64.08.925.232.286.153.532.374.717.645a2.109 2.109 0 0 1 .242 1.883l-2.36 7.201c-.288.814-.48 1.355-1.884 1.355-2.072 0-4.276-.677-6.157-1.256-.472-.145-.924-.284-1.348-.404h-.115V9.478a25.485 25.485 0 0 0 4.238-5.514 1.8 1.8 0 0 1 .901-.83 1.74 1.74 0 0 1 1.21-.048c.396.13.736.397.96.757.225.36.32.788.269 1.211l-1.562 4.63ZM4.177 10H7v8a2 2 0 1 1-4 0v-6.823C3 10.527 3.527 10 4.176 10Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    thích
                  </button>
                  <p className="text-gray-500 text-sm">{blog.describe}</p>
                </div>
              </div>
            ))
          ) : (
            <p> đang load blog</p>
          )}
        </div>
        <div>
          <MovieIsShowing />
        </div>
      </div>
      <Footer />
    </>
  );
};
export default BlogMovies;
