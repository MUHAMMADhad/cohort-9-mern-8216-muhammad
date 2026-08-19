import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Registration LOGIC
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // If anything is missing from all three then error will show or else it is good!
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // For existing user
    const existingUser = await findUserByEmail(email);

    // If user is already registered
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // bcrypt has a 72-byte UTF-8 limit, so passwords longer than that should be rejected both during registration and login.
    const passwordBytes = Buffer.byteLength(password, "utf8");

    if (passwordBytes > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 bytes",
      });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(name, email, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login LOGIC
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find User
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordBytes = Buffer.byteLength(password, "utf8");

    if (passwordBytes > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 bytes",
      });
    }

    // Compare the entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
