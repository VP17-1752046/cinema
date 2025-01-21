import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import ShowtimeSelector from "./ShowtimeSelector";
import moment from "moment";
import ShowtimeForm from "./ShowtimeForm";
import axios from "axios";
import ChangeShowtimeForm from "./ChangeShowtimeForm";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getWeekDays = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const date = moment().add(i, "days");
    days.push({
      day: capitalizeFirstLetter(date.format("dddd")),
      date: date.format("DD/MM"),
      fullDate: date.format("YYYY-MM-DD"),
    });
  }
  return days;
};

function Screening() {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getWeekDays()[0].fullDate);
  const [startIndex, setStartIndex] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isChangeFormVisible, setIsChangeFormVisible] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [cinemaData, setCinemaData] = useState([]);
  const [roomFilteredShowtimes, setRoomFilteredShowtimes] = useState({});
  const [cinemaName, setCinemaName] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [formTimeSlots, setFormTimeSlots] = useState([]);

  const daysToShow = 7;
  const weekDays = getWeekDays();

  const timeSlots = [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "16:00" },
    { start: "17:00", end: "20:00" },
    { start: "21:00", end: "23:59" },
  ];

  useEffect(() => {
    axios
      .get("https://cinema-backend-zeta.vercel.app/api/cinemas")
      .then((response) => {
        const transformedData = response.data.map((cinema) => ({
          id: cinema._id,
          name: cinema.cinemaName,
          rooms: cinema.room.map((roomId) => ({
            id: roomId,
            showtimes: {},
          })),
        }));
        setCinemaData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching cinema data:", error);
      });
  }, []);

  const fetchShowtimesForCinema = async (cinemaId, cinemaRooms) => {
    try {
      const response = await axios.get(
        `https://cinema-backend-zeta.vercel.app/api/showtimes/cinema/${cinemaId}`
      );
      const allShowtimes = response.data;

      const filteredShowtimes = allShowtimes.filter((showtime) =>
        cinemaRooms.includes(showtime.room)
      );

      const filteredShowtimesForSelectedDate = filteredShowtimes.filter(
        (showtime) => {
          return showtime.days.some((day) => {
            const showtimeDay = moment(day).format("YYYY-MM-DD");
            return moment(showtimeDay).isSame(selectedDate, "day");
          });
        }
      );

      return filteredShowtimesForSelectedDate;
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      return [];
    }
  };

  const handleSelectRoom = (room) => {
    if (!room || !room.id) return;

    setSelectedRoom(room);

    const selectedCinema = cinemaData.find((cinema) =>
      cinema.rooms.some((cinemaRoom) => cinemaRoom.id === room.id)
    );

    if (selectedCinema) {
      const cinemaId = selectedCinema.id;
      setCinemaName(selectedCinema.name);
      setCinemaId(cinemaId);

      fetchShowtimesForCinema(cinemaId, [room.id]).then((showtimes) => {
        setRoomFilteredShowtimes((prev) => ({
          ...prev,
          [room.id]: showtimes,
        }));
      });
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleNext = () => {
    if (startIndex + daysToShow < weekDays.length) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  const handleAddShowtimeClick = (cinemaName, roomId, cinemaId, timeSlot) => {
    setSelectedRoom({ id: roomId });
    setIsFormVisible(true);
    setCinemaName(cinemaName);
    setCinemaId(cinemaId);

    // Truyền duy nhất timeSlot vào ShowtimeForm
    setFormTimeSlots([timeSlot]); // Truyền 1 timeSlot duy nhất thay vì tất cả timeSlots
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  const handleChangeShowtimeClick = (showtime) => {
    setSelectedShowtime(showtime);
    setIsChangeFormVisible(true);
  };

  const handleSaveShowtime = (updatedShowtime) => {
    setRoomFilteredShowtimes((prev) => {
      const updatedShowtimes = prev[selectedRoom.id]?.map((st) =>
        st._id === updatedShowtime._id ? updatedShowtime : st
      );
      return { ...prev, [selectedRoom.id]: updatedShowtimes || [] };
    });
    alert("Cập nhật lịch chiếu thành công!");
  };

  return (
    <div className="container">
      <SideBar />
      {isFormVisible && (
        <ShowtimeForm
          onClose={handleCloseForm}
          cinemaName={cinemaName}
          roomNumber={selectedRoom?.id}
          selectedDate={selectedDate}
          cinemaId={cinemaId}
          timeSlots={formTimeSlots} // Truyền duy nhất 1 timeSlot
        />
      )}

      {isChangeFormVisible && (
        <ChangeShowtimeForm
          onClose={() => setIsChangeFormVisible(false)}
          showtime={selectedShowtime}
          onSave={handleSaveShowtime}
        />
      )}

      <div className="main">
        <h2 className="subtitle">Screening Management</h2>
        {cinemaData.map((theater, theaterIndex) => (
          <div key={theater.name} className="dropdown-container">
            <div
              className="dropdown-title"
              onClick={() => toggleDropdown(theaterIndex)}
            >
              {theater.name}
            </div>
            {openDropdownIndex === theaterIndex && (
              <div className="dropdown-menu">
                <div className="content">
                  <ShowtimeSelector
                    weekDays={weekDays}
                    startIndex={startIndex}
                    daysToShow={daysToShow}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleNext={handleNext}
                    handlePrev={handlePrev}
                  />
                  <div className="line"></div>

                  <div className="screen">
                    <div className="room">
                      {theater.rooms.map((room, index) => (
                        <div
                          key={room.id}
                          className="room-number"
                          onClick={() => handleSelectRoom(room)}
                        >
                          <h3>Rạp {index + 1}</h3>
                          <p>
                            Số suất chiếu:{" "}
                            {roomFilteredShowtimes[room.id]?.length || 0} / 4
                          </p>
                        </div>
                      ))}
                    </div>

                    {selectedRoom && roomFilteredShowtimes[selectedRoom.id] && (
                      <div className="showtimes">
                        {timeSlots.map((slot, index) => (
                          <div key={index} className="box-showtime">
                            {roomFilteredShowtimes[selectedRoom.id].length >
                            index ? (
                              <div>
                                <h4>Suất chiếu {index + 1}</h4>
                                <h5>Phim đang chiếu</h5>
                                <div className="line"></div>
                                <div className="poster">
                                  <img
                                    src={
                                      roomFilteredShowtimes[selectedRoom.id][
                                        index
                                      ].movie.img
                                    }
                                    alt={
                                      roomFilteredShowtimes[selectedRoom.id][
                                        index
                                      ].movie.title
                                    }
                                    style={{ width: "100%", height: "100%" }}
                                  />
                                </div>
                                <p>
                                  Tên phim:{" "}
                                  <span>
                                    {
                                      roomFilteredShowtimes[selectedRoom.id][
                                        index
                                      ].movie.title
                                    }
                                  </span>
                                </p>
                                <p>
                                  Suất Chiếu:{" "}
                                  <span>
                                    {
                                      roomFilteredShowtimes[selectedRoom.id][
                                        index
                                      ].times
                                    }
                                  </span>
                                </p>
                                <a
                                  className="btn-room"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleChangeShowtimeClick(
                                      roomFilteredShowtimes[selectedRoom.id][
                                        index
                                      ]
                                    );
                                  }}
                                >
                                  Thay đổi lịch chiếu
                                </a>
                              </div>
                            ) : (
                              <div>
                                <h4>Suất chiếu {index + 1}</h4>
                                <h5>Rạp trống</h5>
                                <div className="line"></div>
                                <a
                                  href="#"
                                  className="btn-room"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleAddShowtimeClick(
                                      theater.name,
                                      selectedRoom?.id,
                                      theater.id,
                                      slot
                                    );
                                  }}
                                >
                                  Thêm lịch chiếu
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screening;
