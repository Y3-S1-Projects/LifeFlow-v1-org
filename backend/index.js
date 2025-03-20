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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

// Middleware Order
app.use(cookieParser());
app.use(express.json());




// Allow requests from your frontend
app.use(
  cors({
    origin: "*", // Allow local frontend to access
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // If using cookies/authentication
  })
);

// No need to loggin for these routes
app.use("/api/contact", contactRoutes);

// CSRF Protection Setup
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] || req.cookies["x-csrf-token"]?.split("|")[0], // Read from both
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

// Apply CSRF protection after token endpoint
app.use(doubleCsrfProtection);

// Routes
app.use("/users", userRoutes);
app.use("/api", loginUser);
app.use("/camps", campRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/organizers", organizerRoutes);
app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/admin", adminRoutes);


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
