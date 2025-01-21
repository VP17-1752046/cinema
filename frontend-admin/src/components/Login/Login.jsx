import React, { useState } from "react";
import "./Login.css";
import NotificationModal from "../NotificationModal/NotificationModal.jsx";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://cinema-backend-zeta.vercel.app/api/users/login-admin",
        formData
      );

      const { isAdmin, token } = response.data;

      if (isAdmin) {
        localStorage.setItem("adminToken", token);
        setModalMessage("Đăng nhập thành công!");
        setIsModalOpen(true);

        setTimeout(() => {
          setIsModalOpen(false);
          window.location.href = "/Dashboard";
        }, 2000);
      } else {
        setModalMessage("Tài khoản này không có quyền truy cập Admin.");
        setIsModalOpen(true);
      }
    } catch (err) {
      setModalMessage(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="admin-login-container">
      <NotificationModal
        message={modalMessage}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <div className="admin-login-form">
        <h2 className="admin-login-title">Đăng nhập Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-login-form-group">
            <label htmlFor="email" className="admin-login-label">
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleInputChange}
              className="admin-login-input"
              required
            />
          </div>
          <div className="admin-login-form-group">
            <label htmlFor="password" className="admin-login-label">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="admin-login-input"
              required
            />
          </div>
          <button type="submit" className="admin-login-button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
