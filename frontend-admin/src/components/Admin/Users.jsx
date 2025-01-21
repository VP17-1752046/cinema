import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideBar";
import "./Admin.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showModal, setShowModal] = useState(false);
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // User đang được chỉnh sửa
  // const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // Trạng thái Modal thông báo
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false); // Modal thông báo thất bại
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Modal xác nhận xóa
  const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] =
    useState(false); // Modal thông báo xóa thành công
  // const [isAddSuccessModalVisible, setIsAddSuccessModalVisible] =
  //   useState(false); // Modal thông báo thêm thành công
  // const [isAddErrorModalVisible, setIsAddErrorModalVisible] = useState(false);
  // const [newUser, setNewUser] = useState({
  //   fullName: "",
  //   email: "",
  //   phone: "",
  //   sex: "",
  //   dateOfBirth: "",
  //   password: "",
  // });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://cinema-backend-zeta.vercel.app/api/users/"
        );
        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        setError("Failed to fetch movies. Please try again.");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // const handleAddUser = async () => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/users/register/",
  //       newUser
  //     );
  //     setUsers([...users, response.data]); // Thêm phim mới vào danh sách
  //     setShowModal(false); // Ẩn modal
  //     setNewUser({
  //       fullName: "",
  //       email: "",
  //       phone: "",
  //       sex: "",
  //       dateOfBirth: "",
  //       password: "",
  //     });
  //     setIsAddSuccessModalVisible(true); // Hiển thị modal thông báo thành công
  //     setTimeout(() => setIsAddSuccessModalVisible(false), 3000); // Tự động đóng sau 3 giây
  //   } catch (error) {
  //     setIsAddErrorModalVisible(true); // Hiển thị modal thông báo thất bại
  //     setTimeout(() => setIsAddErrorModalVisible(false), 3000); // Tự động đóng modal
  //   }
  // };

  // const handleAddInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewUser({ ...newUser, [name]: value });
  // };

  // const handleEditClick = async (userId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:5000/api/users/${userId}`
  //     );
  //     setSelectedUser(response.data); // Lấy thông tin User được chọn
  //     setIsModalVisible(true); // Hiển thị modal
  //   } catch (error) {
  //     console.error("Failed to fetch user by ID:", error);
  //   }
  // };

  // const handleUpdateUser = async () => {
  //   try {
  //     await axios.put(
  //       `http://localhost:5000/api/users/update-admin/${selectedUser._id}`,
  //       selectedUser
  //     );
  //     // Cập nhật danh sách phim trong state
  //     setUsers((prevUsers) =>
  //       prevUsers.map((user) =>
  //         user._id === selectedUser._id ? selectedUser : user
  //       )
  //     );
  //     setIsSuccessModalVisible(true); // Hiển thị modal thông báo
  //     setTimeout(() => setIsSuccessModalVisible(false), 3000); // Tự động đóng sau 3 giây
  //   } catch (error) {
  //     setIsErrorModalVisible(true); // Hiển thị modal thất bại
  //     setTimeout(() => setIsErrorModalVisible(false), 3000); // Tự động đóng modal
  //   }
  // };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setSelectedUser({ ...selectedUser, [name]: value });
  // };

  // const formatDateForInput = (dateString) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   return date.toISOString().split("T")[0];
  // };

  const handleDeleteClick = (userId) => {
    // Hiển thị modal xác nhận xóa
    const userToDelete = users.find((user) => user._id === userId);
    setSelectedUser(userToDelete);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Gọi API DELETE để xóa phim
      await axios.delete(
        `https://cinema-backend-zeta.vercel.app/api/users/delete-admin/${selectedUser._id}`
      );
      // Cập nhật danh sách phim trong state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== selectedUser._id)
      );
      setSelectedUser(null);
      setIsDeleteModalVisible(false); // Đóng modal xác nhận
      setIsDeleteSuccessModalVisible(true); // Hiển thị modal xóa thành công
      setTimeout(() => setIsDeleteSuccessModalVisible(false), 3000); // Tự động đóng modal sau 3 giây
    } catch (error) {
      console.error("Failed to delete user:", error);
      setIsErrorModalVisible(true);
      setTimeout(() => setIsErrorModalVisible(false), 3000); // Tự động đóng modal
    }
  };

  const handleDeleteCancel = () => {
    setSelectedUser(null);
    setIsDeleteModalVisible(false); // Đóng modal xác nhận
  };

  return (
    <div className="container">
      <Sidebar />
      <main className="main">
        <div className="user-title">
          <h2 className="subtitle">All Users</h2>
          {/* <button className="add-btn" onClick={() => setShowModal(true)}>
            Add User
          </button> */}
        </div>

        {isLoading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>SEX</th>
                <th>DATE OF BIRTH</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  style={{ display: user.fullName === "admin" ? "none" : "" }}
                >
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.sex}</td>
                  <td>
                    {new Date(user.dateOfBirth).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    {/* <button
                      className="btn edit"
                      onClick={() => handleEditClick(user._id)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button> */}
                    <button
                      className="btn delete"
                      onClick={() => handleDeleteClick(user._id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal */}
        {/* {isModalVisible && selectedUser && (
          <div className="modal-edit">
            <div className="modal-edit-content">
              <h3>Edit User</h3>
              <form>
                <label>
                  Full Name:
                  <input
                    type="text"
                    name="fullName"
                    value={selectedUser.fullName || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="text"
                    name="email"
                    value={selectedUser.email || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="number"
                    name="phone"
                    value={selectedUser.phone || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Sex:
                  <input
                    type="text"
                    name="sex"
                    value={selectedUser.sex || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Date of Birth:
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formatDateForInput(selectedUser.dateOfBirth)}
                    onChange={handleInputChange}
                  />
                </label>
              </form>
              <button className="btn save" onClick={handleUpdateUser}>
                Save
              </button>
              <button
                className="btn cancel"
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )} */}
        {/* Modal thông báo cập nhật thành công */}
        {/* {isSuccessModalVisible && (
          <div className="modal-noti">
            <div className="modal-noti-content">
              <h3>Success</h3>
              <p>User updated successfully!</p>
              <button
                className="btn-noti-close"
                onClick={() => setIsSuccessModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )} */}
        {/* Modal thông báo thất bại */}
        {/* {isErrorModalVisible && (
          <div className="modal-noti">
            <div className="modal-noti-content">
              <h3>Error</h3>
              <p>Failed to update user. Please try again.</p>
              <button
                className="btn-noti-close"
                onClick={() => setIsErrorModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )} */}
        {/* {showModal && (
          <div className="modal-add">
            <div className="modal-add-content">
              <h3>Add New User</h3>
              <form>
                <label>
                  Full Name:
                  <input
                    type="text"
                    name="fullName"
                    value={newUser.fullName}
                    onChange={handleAddInputChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="text"
                    name="email"
                    value={newUser.email}
                    onChange={handleAddInputChange}
                  />
                </label>
                <label>
                  Password:
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleAddInputChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="number"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleAddInputChange}
                  />
                </label>
                <label>
                  Sex:
                  <input
                    type="text"
                    name="sex"
                    value={newUser.sex}
                    onChange={handleAddInputChange}
                  />
                </label>
                <label>
                  Date Of Birth:
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newUser.dateOfBirth}
                    onChange={handleAddInputChange}
                  />
                </label>
              </form>
              <div className="btns-add">
                <button className="btn save" onClick={handleAddUser}>
                  Add
                </button>
                <button
                  className="btn cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )} */}
        {/* Modal thông báo thêm thành công */}
        {/* {isAddSuccessModalVisible && (
          <div className="modal-noti">
            <div className="modal-noti-content">
              <h3>Success</h3>
              <p>User added successfully!</p>
              <button
                className="btn-noti-close"
                onClick={() => setIsAddSuccessModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )} */}
        {/* Modal Xác Nhận Xóa */}
        {isDeleteModalVisible && selectedUser && (
          <div className="modal-confirm">
            <div className="modal-confirm-content">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete account{" "}
                <strong>{selectedUser.email}</strong>?
              </p>
              <button className="btn confirm" onClick={handleDeleteConfirm}>
                Yes
              </button>
              <button className="btn cancel" onClick={handleDeleteCancel}>
                No
              </button>
            </div>
          </div>
        )}
        {/* Modal thông báo xóa thành công */}
        {isDeleteSuccessModalVisible && (
          <div className="modal-delete">
            <div className="modal-delete-content">
              <h3>Success</h3>
              <p>User deleted successfully!</p>
              <button
                className="btn-noti-close"
                onClick={() => setIsDeleteSuccessModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal thông báo thêm thất bại */}
        {/* {isAddErrorModalVisible && (
          <div className="modal-noti">
            <div className="modal-noti-content">
              <h3>Error</h3>
              <p>Failed to add user. Please try again.</p>
              <button
                className="btn-noti-close"
                onClick={() => setIsAddErrorModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
};

export default Users;
