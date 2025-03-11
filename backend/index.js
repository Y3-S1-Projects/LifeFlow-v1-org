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
import adminRoutes from "./routes/adminRoutes.js";
import csrf from "csurf";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy (required for Railway deployment)
app.set("trust proxy", 1);

// Order of middleware is important
app.use(cookieParser());
app.use(express.json());

// Configure CORS before CSRF
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://lifeflow-woad.vercel.app",
      "https://lifeflow-woad.vercel.app/",
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization,X-CSRF-Token",
    credentials: true,
  })
);

// Create CSRF middleware - BUT DON'T APPLY IT GLOBALLY YET
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "none",
    // secure: process.env.NODE_ENV === "production" ? true : false,
    secure: false,
  },
});

// CSRF token endpoint - must come BEFORE applying csrf globally
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Now apply CSRF protection to all other routes
app.use(csrfProtection);

// Routes
app.use("/users", userRoutes);
app.use("/api", loginUser);
app.use("/camps", campRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/organizers", organizerRoutes);
app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/admin", adminRoutes);

// MongoDB connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
