import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";
import loginUser from "./routes/loginRoute.js";
import campRoutes from "./routes/campRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: `http://localhost:3000`, // Allow only your frontend
    methods: "GET,POST,PUT,DELETE", // Allowed request methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
  })
);

app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

app.use("/users", userRoutes);
app.use("/api", loginUser);
app.use("/camps", campRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/organizers", organizerRoutes);
app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
