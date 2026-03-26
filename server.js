// Force new deployment to reload environment variables
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const saltRounds = 10; // for bcrypt

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// DATABASE CONNECTION
// Use connection string for easier cloud setup
const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'leeian'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'ecommerce'}`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// INITIALIZE DATABASE TABLES
async function initDB() {
  console.log("Checking database connection...");
  try {
    // Try to connect once to verify connection
    const client = await pool.connect();
    console.log("Successfully connected to the database!");
    client.release();

    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        verification_code VARCHAR(6),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table verified.");

    // Create Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        contact VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100),
        cart JSONB NOT NULL,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Orders table verified.");

    // Create Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) DEFAULT 'Anonymous',
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Reviews table verified.");

    console.log("Database tables initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err.message);
    console.error("Stack trace:", err.stack);
  }
}

initDB();

// TEST
app.get("/", (req, res) => {
  res.send("Server running");
});

// SECRET RESET ROUTE (Use this to clear users without SQL Shell)
app.get("/reset-users", async (req, res) => {
  try {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY");
    res.send("Users table cleared successfully! You can now register again.");
  } catch (err) {
    res.status(500).send("Error clearing users: " + err.message);
  }
});

// DIAGNOSTIC ROUTE (Check current users)
app.get("/check-users", async (req, res) => {
  try {
    const result = await pool.query("SELECT email, is_verified FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
});

// MANUAL VERIFICATION ROUTE (INSECURE - FOR TESTING ONLY)
app.get("/manual-verify", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Please provide an email in the query string, e.g., /manual-verify?email=user@example.com");
  }

  try {
    const result = await pool.query("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = $1 RETURNING *", [email]);

    if (result.rows.length > 0) {
      res.send(`User ${email} has been manually verified. You can now log in.`);
    } else {
      res.status(404).send(`User ${email} not found.`);
    }
  } catch (err) {
    console.error("Manual verification error:", err);
    res.status(500).send("An error occurred during manual verification.");
  }
});

// SAVE ORDER
app.post("/orders", async (req, res) => {
  try {
    const { name, address, contact, paymentMethod, referenceNumber, cart, userEmail } = req.body;

    const result = await pool.query(
      "INSERT INTO orders (name, address, contact, payment_method, reference_number, cart, user_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, address, contact, paymentMethod, referenceNumber || null, JSON.stringify(cart), userEmail || null]
    );

    res.json({ message: "Order saved!", order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving order");
  }
});

// GET USER ORDERS
app.get("/my-orders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query(
      "SELECT * FROM orders WHERE user_email = $1 ORDER BY id DESC",
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
});

// USER REGISTRATION
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      const user = userExists.rows[0];
      if (!user.is_verified) {
        // If user exists but is not verified, generate and email a new code
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        await pool.query("UPDATE users SET verification_code = $1 WHERE email = $2", [newCode, email]);

        const msg = {
          to: email,
          from: '"Ilivate Support" <leeian.lacorte19@gmail.com>',
          subject: 'Your New Ilivate Verification Code',
          html: `<b>You requested a new code.</b><p>Your new verification code is: <strong>${newCode}</strong></p>`,
        };

        try {
          await sgMail.send(msg);
          return res.status(200).json({
            message: "A new verification code has been sent to your email.",
            unverified: true
          });
        } catch (error) {
          console.error('SendGrid Error (resending code):', error.response ? error.response.body : error.message);
          console.log(`FALLBACK: New verification code for ${email} is ${newCode}`);
          return res.status(500).json({ 
            message: `Email failed. FOR TESTING: Your code is ${newCode}`,
            unverified: true 
          });
        }
      }
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const result = await pool.query(
      "INSERT INTO users (email, password, verification_code) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, verificationCode]
    );

    const msg = {
      to: email,
      from: '"Ilivate Support" <leeian.lacorte19@gmail.com>', // Use your verified sender
      subject: 'Your Ilivate Verification Code',
      html: `<b>Thank you for registering!</b><p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    try {
      await sgMail.send(msg);
      res.json({ message: "Registration successful! Please check your email for your verification code." });
    } catch (error) {
      console.error('SendGrid Error:', error.response ? JSON.stringify(error.response.body) : error.message);
      console.log(`FALLBACK: Verification code for ${email} is ${verificationCode}`);
      res.status(500).json({ 
        message: `Registration successful, but email failed. FOR TESTING: Your code is ${verificationCode}` 
      });
    }

  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
      return res.status(500).json({ message: "Email service failed. Check your internet connection or Nodemailer config." });
    } else if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ message: "A user with this email already exists." });
    } else if (err.routine === 'scanner_yyerror') { // PostgreSQL syntax error
        return res.status(500).json({ message: "Database query error. Check if the 'users' table exists." });
    }
    res.status(500).json({ message: "An unexpected error occurred during registration." });
  }
});

// VERIFY USER
app.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND verification_code = $2", [email, code]);

    if (result.rows.length > 0) {
      await pool.query("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = $1", [email]);
      res.json({ message: "Account verified successfully! You can now log in." });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "An unexpected error occurred during verification." });
  }
});

// USER LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (!user.is_verified) {
        return res.status(401).json({ message: "Account not verified. Please check your email for the verification code." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // In a real app, you would generate a JWT token here
        res.json({ message: "Login successful", token: "dummy-token" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// GET USER PROFILE
app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userEmail = req.headers["x-user-email"];

    if (!authHeader || !userEmail) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const result = await pool.query("SELECT email, is_verified, created_at FROM users WHERE email = $1", [userEmail]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
});

// GET REVIEWS FOR A PRODUCT
app.get("/reviews/:productName", async (req, res) => {
  try {
    const { productName } = req.params;
    const result = await pool.query(
      "SELECT * FROM reviews WHERE product_name = $1 ORDER BY created_at DESC",
      [productName]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching reviews");
  }
});

// POST A NEW REVIEW
app.post("/reviews", async (req, res) => {
  try {
    const { productName, userEmail, rating, comment } = req.body;
    
    if (!productName || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO reviews (product_name, user_email, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [productName, userEmail || 'Anonymous', rating, comment]
    );

    res.json({ message: "Review added!", review: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving review");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});