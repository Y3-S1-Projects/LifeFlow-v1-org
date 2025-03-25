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
import { doubleCsrf } from "csrf-csrf";
import cors from "cors";
import cookieParser from "cookie-parser";
import contactRoutes from "./routes/contactRoutes.js";
import fileMiddleware from './middleware/fileMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

// Middleware Order
app.use(cookieParser());
app.use(express.json());
app.use(fileMiddleware);

// Allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow local frontend to access
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // If using cookies/authentication
  })
);

// CSRF Protection Setup
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] || req.cookies["x-csrf-token"]?.split("|")[0],
  cookieName: "x-csrf-token",
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: "none",
  },
});

// CSRF Token Endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// Routes that DO NOT need CSRF protection
app.use("/api/contact", contactRoutes);

// Routes that NEED CSRF protection
app.use("/users", doubleCsrfProtection, userRoutes);
app.use("/api", loginUser);
app.use("/camps", doubleCsrfProtection, campRoutes);
app.use("/appointments", doubleCsrfProtection, appointmentRoutes);
app.use("/organizers", doubleCsrfProtection, organizerRoutes);
app.use("/auth", doubleCsrfProtection, authRoutes);
app.use("/chatbot", doubleCsrfProtection, chatbotRoutes);
app.use("/admin", doubleCsrfProtection, adminRoutes);

// MongoDB Connection with Error Handling
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri)
  .then(() =>
    console.log("MongoDB database connection established successfully")
  )
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
