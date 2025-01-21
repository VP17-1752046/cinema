import React, { useState } from "react";
import "./Register.css";
import logo from "../img/logoLogin.svg";
import NotificationModal from "../NotificationModal/NotificationModal.jsx";
import axios from "axios";

function Register({ isOpen, onClose, onLoginClick }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    sex: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({ ...prevData, sex: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Mật khẩu không khớp!",
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://cinema-backend-zeta.vercel.app/api/users/register",
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          sex: formData.sex,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
        }
      );

      setModal({
        isOpen: true,
        title: "Success",
        message: "Đăng ký thành công!",
      });

      console.log("Registration successful:", response.data);

      setTimeout(() => {
        onClose();
        onLoginClick();
      }, 3000);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Đăng ký thất bại!",
      });
    }
  };

  const handleModalClose = () => {
    setModal({ isOpen: false, title: "", message: "" });
  };

  return (
    <div className={`realtive modal ${isOpen ? "is-open" : ""}`}>
      <div className="modal-content font-nunito absolute top-4 left-1/3 m-0  rounded-lg ">
        <div className="register-container  ">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <img
            alt="Cartoon image of two dogs and a hat"
            src={logo}
            style={{ height: "100px", width: "200px" }}
          />
          <h2>Đăng Ký Tài Khoản</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                placeholder="Nhập Họ và tên"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group flex justify-between">
              <div>
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
              <div>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  placeholder="Nhập Số điện thoại"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group flex justify-between  ">
              <div className="flex items-center text-xl">
                <label
                  className="h-fit mr-4
              "
                >
                  Giới tính
                </label>
                <div className="radio-group">
                  <input
                    id="male"
                    name="sex"
                    type="radio"
                    value="Nam"
                    checked={formData.sex === "Nam"}
                    onChange={handleRadioChange}
                    required
                  />
                  <label htmlFor="male">Nam</label>
                  <input
                    id="female"
                    name="sex"
                    type="radio"
                    value="Nữ"
                    checked={formData.sex === "Nữ"}
                    onChange={handleRadioChange}
                    required
                  />
                  <label htmlFor="female">Nữ</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="dateOfBirth">Ngày sinh</label>
                <input
                  id="dateOfBirth"
                  className="h-fit border border-[#ccc] p-1"
                  placeholder="Ngày/Tháng/Năm"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group"></div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                placeholder="Nhập Mật khẩu"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
              <input
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input id="terms" type="checkbox" required />
                <label className="terms" htmlFor="terms">
                  Bằng việc đăng ký tài khoản, tôi đồng ý với
                  <a href="#"> Điều khoản dịch vụ </a> và
                  <a href="#"> Chính sách bảo mật </a> của Galaxy Cinema.
                </label>
              </div>
            </div>
            <button className="btn" type="submit">
              HOÀN THÀNH
            </button>
          </form>
          <NotificationModal
            isOpen={modal.isOpen}
            onClose={handleModalClose}
            title={modal.title}
            message={modal.message}
          />
          <div className="login-link">
            Bạn đã có tài khoản?
            <a className="login-button" href="#" onClick={onLoginClick}>
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
