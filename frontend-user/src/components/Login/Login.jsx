import React, { useState } from "react";
import "./Login.css";
import logo from "../img/logoLogin.svg";
import NotificationModal from "../NotificationModal/NotificationModal.jsx";
import ForgotPassword from "../ForgotPassword/ForgotPassword.jsx";
import axios from "axios";

function Login({ isOpen, onClose, onRegisterClick, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://cinema-backend-zeta.vercel.app/api/users/login",
        formData
      );
      const { data } = response;
      const user = data.user || data;
      onLoginSuccess(user);

      setModal({
        isOpen: true,
        title: "Success",
        message: "Đăng nhập thành công!",
      });

      setTimeout(() => {
        setModal({ isOpen: false, title: "", message: "" });
        onClose();
        window.location.reload();
      }, 3000);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Đăng nhập thất bại. Vui lòng kiểm tra thông tin!",
      });
    }
  };

  const handleModalClose = () => {
    setModal({ isOpen: false, title: "", message: "" });
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword
        isOpen={true}
        onClose={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className={`auth-modal ${isOpen ? "is-open" : ""}`}>
      <div className="auth-modal-content">
        <div className="auth-container">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <img
            alt="Cartoon image of two dogs and a hat"
            src={logo}
            style={{ height: "100px", width: "200px" }}
          />
          <h2>Đăng Nhập Tài Khoản</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                placeholder="Nhập Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="icon-input">
                <input
                  id="password"
                  placeholder="Nhập Mật khẩu"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fa fa-eye-slash"></i>
              </div>
            </div>
            <button className="auth-btn" type="submit">
              ĐĂNG NHẬP
            </button>
          </form>
          <NotificationModal
            isOpen={modal.isOpen}
            onClose={handleModalClose}
            title={modal.title}
            message={modal.message}
          />
          <div className="forgot-password-link">
            <a href="#" onClick={handleForgotPasswordClick}>
              Quên mật khẩu?
            </a>
          </div>
          <hr />
          <div className="register-section">
            <span>Bạn chưa có tài khoản?</span>
            <a className="register-link" href="#" onClick={onRegisterClick}>
              Đăng ký
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
