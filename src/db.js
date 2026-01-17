import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;

// SQL to create users table (run once):
// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   name TEXT,
//   email TEXT UNIQUE NOT NULL,
//   password TEXT NOT NULL
// );
