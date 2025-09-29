// 1. Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies from Angular
// Configure CORS to allow requests from your Angular application's origin
app.use(cors({
    origin: 'http://localhost:4200' // <-- Adjust if your Angular app runs on a different port/host
}));

// 2. PostgreSQL Connection Pool Setup
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false
    } 
});

// Test the database connection
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL!'))
  .catch(err => console.error('Database connection error:', err));


// 3. API Route to Handle Registration (POST /api/students)
app.post('/api/students', async (req, res) => {
    // Data sent from the Angular form (reg-form.component.ts)
    const { firstName, lastName, email, course } = req.body; 

    // SQL query to insert data into the 'students' table
    const queryText = `
        INSERT INTO students(first_name, last_name, email, course) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
    `;
    const values = [firstName, lastName, email, course];

    try {
        const result = await pool.query(queryText, values);
        console.log('New student registered:', result.rows[0]);
        // Send a success response back to Angular
        res.status(201).json({ 
            message: 'Student registered successfully', 
            student: result.rows[0] 
        });
    } catch (err) {
        console.error('Database insertion error:', err.stack);
        // Send an error response back to Angular
        res.status(500).json({ 
            message: 'Error registering student', 
            error: err.message 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});