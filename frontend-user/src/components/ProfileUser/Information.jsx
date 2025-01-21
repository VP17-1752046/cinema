import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

import moment from "moment";
import "./Profile.css";
const Information = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        fullName: parsedUser.fullName,
        email: parsedUser.email,
        phone: parsedUser.phone,
        sex: parsedUser.sex,
        dateOfBirth: parsedUser.dateOfBirth
          ? moment(parsedUser.dateOfBirth).format("DD/MM/YYYY")
          : "",
        password: parsedUser.password,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [id]: value,
    }));
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      // Lấy token từ localStorage (nếu sử dụng authentication)
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const token = storedUser.token;

      // Gửi request update tới backend
      const response = await axios.put(
        "https://cinema-backend-zeta.vercel.app/api/users/update",
        {
          email: user.email,
          password: user.password, // Chỉ gửi password nếu có thay đổi
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật localStorage với thông tin mới
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          ...storedUser,
          email: response.data.email,
        })
      );

      // Reset state
      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Cập nhật thất bại. Vui lòng thử lại.");

      // Tự động ẩn thông báo lỗi sau 3 giây
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div>
      <div className="profile-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-form-group">
          <div className="profile-input-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input type="text" id="fullName" value={user.fullName} disabled />
          </div>
          <div className="profile-input-group">
            <label htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              type="text"
              id="dateOfBirth"
              value={user.dateOfBirth}
              disabled
            />
          </div>
          <div className="profile-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={user.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="profile-input-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input type="text" id="phone" value={user.phone} disabled />
          </div>
          <div className="profile-input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu mới (để trống nếu không muốn thay đổi)"
              value={user.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="profile-input-group">
            <div className="gender">
              <label>Giới tính</label>
              <input
                type="radio"
                id="male"
                name="sex"
                value="Nam"
                checked={user.sex === "Nam"}
                disabled
              />
              <label htmlFor="male">Nam</label>
              <input
                type="radio"
                id="female"
                name="sex"
                value="Nữ"
                checked={user.sex === "Nữ"}
                disabled
              />
              <label htmlFor="female">Nữ</label>
            </div>
          </div>
          <button
            className="btn-update"
            onClick={handleUpdate}
            disabled={!isEditing}
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

export default Information;
