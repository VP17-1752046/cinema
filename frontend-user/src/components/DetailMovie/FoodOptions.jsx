import axios from "axios";
import React, { useState, useEffect } from "react";

const FoodOptions = ({ onFoodSelect }) => {
  const [foods, setFoods] = useState([]); // Danh sách món ăn
  const [quantities, setQuantities] = useState({}); // Quản lý số lượng từng món ăn

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await axios.get(
          `https://cinema-backend-zeta.vercel.app/api/movie/food`
        );
        setFoods(response.data);

        // Khởi tạo số lượng mặc định cho từng món ăn (bắt đầu từ 0)
        const initialQuantities = {};
        response.data.forEach((food) => {
          initialQuantities[food._id] = 0;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Lỗi fetching food:", error);
      }
    };
    fetchFood();
  }, []);

  const updateSelectedFoods = (foodId, foodName, foodPrice, quantity) => {
    const parsedPrice = parseFloat(foodPrice) || 0; // Đảm bảo giá là số
    const parsedQuantity = parseInt(quantity, 10) || 0; // Đảm bảo số lượng là số nguyên

    onFoodSelect(foodId, foodName, parsedPrice, parsedQuantity);
  };
  // Hàm giảm số lượng
  const decrement = (id, name, price) => {
    setQuantities((prevQuantities) => {
      const newQuantity = Math.max((prevQuantities[id] || 0) - 1, 0);
      updateSelectedFoods(id, name, price, newQuantity);
      return {
        ...prevQuantities,
        [id]: newQuantity,
      };
    });
  };

  // Hàm tăng số lượng
  const increment = (id, name, price) => {
    setQuantities((prevQuantities) => {
      const newQuantity = (prevQuantities[id] || 0) + 1;
      updateSelectedFoods(id, name, price, newQuantity);
      return {
        ...prevQuantities,
        [id]: newQuantity,
      };
    });
  };
  return (
    <>
      {foods.length > 0 ? (
        foods.map((food) => (
          <div
            key={food._id}
            className="flex justify-between items-center font-nunito mb-8"
          >
            <div className="flex gap-5 items-center">
              <img className="w-20" src={food.img} alt={food.nameF} />
              <div>
                <p className="mb-4 text-gray-800 text-xl font-medium">
                  {food.nameF}
                </p>
                <div className="relative flex items-center">
                  {/* Nút giảm */}
                  <button
                    type="button"
                    className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    onClick={() => decrement(food._id, food.nameF, food.price)}
                  >
                    <svg
                      className="w-2.5 h-2.5 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 2"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1h16"
                      />
                    </svg>
                  </button>

                  {/* Ô input số lượng */}
                  <input
                    type="text"
                    readOnly
                    className="flex-shrink-0 text-gray-900 border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center"
                    value={quantities[food._id] || 0}
                  />

                  {/* Nút tăng */}
                  <button
                    type="button"
                    className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 inline-flex items-center justify-center border border-gray-300 rounded-md h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    onClick={() => increment(food._id, food.nameF, food.price)}
                  >
                    <svg
                      className="w-2.5 h-2.5 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 18"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 1v16M1 9h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-800">
              {food.price.toLocaleString()} VNĐ
            </p>
          </div>
        ))
      ) : (
        <p>Đang load món ăn...</p>
      )}
    </>
  );
};

export default FoodOptions;
