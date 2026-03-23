const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce",
  password: "leeian",
  port: 5432,
});

// TEST
app.get("/", (req, res) => {
  res.send("Server running");
});

// SAVE ORDER
app.post("/orders", async (req, res) => {
  try {
    const { name, address, contact, cart } = req.body;

    const result = await pool.query(
      "INSERT INTO orders (name, address, contact, cart) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, address, contact, JSON.stringify(cart)]
    );

    res.json({ message: "Order saved!", order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving order");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});