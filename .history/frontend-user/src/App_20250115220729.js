import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomeMovie from "./components/HomeMovie/HomeMovie";
import DetailMovie from "./components/DetailMovie/DetailMovie";
import Profile from "./components/ProfileUser/ProfileUser";
import Cinema from "./components/Cinema/Cinema";
import Booking from "./components/DetailMovie/Booking.jsx";
import Transaction from "./components/ProfileUser/Transaction.jsx";
import BlogMovies from "./components/HomeMovie/BlogMovies.jsx";
import Ticket from "./components/ProfileUser/Ticket.jsx";
import Endows from "./components/Header/endows.jsx";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomeMovie />} />
          <Route path="/DetailMovie/:id" element={<DetailMovie />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/rap-phim/:location" element={<Cinema />} />
          <Route path="/Booking/:id" element={<Booking />} />
          <Route path="/Ticket" element={< Ticket />} />
          <Route path="/Blog-Movies" element={<BlogMovies />} />
          <Route path="/Endows" element={<Endows />} />

        </Routes>
      </Router>

    </>
  );
}

export default App;