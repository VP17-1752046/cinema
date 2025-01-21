import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./Routes/UserRouter.js";
import userMovie from "./Routes/MovieRouter.js";
import userCinema from "./Routes/CinemaRouter.js";
import showtimeRouter from "./Routes/ShowtimeRouter.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { connect } from "./config/db.js";
import movieRouter from "./Routes/MovieRouter.js";
import roomRouter from "./Routes/RoomRouter.js";
import paymentRouter from "./Routes/PaymentRouter.js";
import bookingRouter from "./Routes/BookingRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "https://cinema-pi-three.vercel.app",
      "https://cinema-admin-sigma.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect DB
connect();

// Routes
app.use("/api/users", userRouter);
app.use("/api/movies", userMovie);
app.use("/api/cinemas", userCinema);
app.use("/api/movie", movieRouter);
app.use("/api/showtimes", showtimeRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/momo", paymentRouter);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base route
app.get("/", (req, res) => {
  res.send("API is running ...");
});

// Error handler
app.use(errorHandler);

// Only run app.listen in development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
  });
}

export default app;
