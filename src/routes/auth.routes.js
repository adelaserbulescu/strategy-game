import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "change_this_secret";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing email or password" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING id, name, email",
      [name || null, email, hashed]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "User already exists" });
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing email or password" });

  try {
    const result = await db.query("SELECT id, name, email, password FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
    delete user.password;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

export default router;
