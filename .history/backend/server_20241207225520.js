import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import { connectDB } from "./config/db.js";
import { connectDBM } from "./config/dbmovie.js";
import userRouter from "./Routes/UserRouter.js";
import movieRouter from "./Routes/MovieRouter.js"
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect DB
//connectDB();

// DB movie
connectDBM();

app.get("/", (req, res) => {
  res.send("API is running ...");
});

app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter)

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in http://localhost/${PORT}`);
});