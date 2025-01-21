import React, { useState } from "react";
import axios from "axios";
import NotificationModal from "../NotificationModal/NotificationModal";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://cinema-backend-zeta.vercel.app/api/users/check-email",
        { email }
      );
      if (response.data.exists) {
        setStep(2);
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Email không tồn tại trong hệ thống!",
      });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Mật khẩu không khớp!",
      });
      return;
    }

    try {
      await axios.post(
        "https://cinema-backend-zeta.vercel.app/api/users/reset-password",
        {
          email,
          newPassword,
        }
      );

      setModal({
        isOpen: true,
        title: "Success",
        message: "Đặt lại mật khẩu thành công!",
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  const handleModalClose = () => {
    setModal({ isOpen: false, title: "", message: "" });
  };

  return (
    <div className={`auth-modal ${isOpen ? "is-open" : ""}`}>
      <div className="auth-modal-content">
        <div className="auth-container">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <h2>Quên Mật Khẩu</h2>
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="auth-btn" type="submit">
                Tiếp tục
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button className="auth-btn" type="submit">
                Đặt lại mật khẩu
              </button>
            </form>
          )}
          <NotificationModal
            isOpen={modal.isOpen}
            onClose={handleModalClose}
            title={modal.title}
            message={modal.message}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
