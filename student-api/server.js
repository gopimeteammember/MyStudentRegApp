// 1. Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const cors = require('cors');

const app = express();
const port = process.env.port || 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies from Angular
// Configure CORS to allow requests from your Angular application's origin
app.use(cors({
    origin: ['http://localhost:4200'] // <-- Adjust if your Angular app runs on a different port/host
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


app.post('/api/student', async (req, res) => {
    // Data sent from the Angular form (camelCase)
    const { firstName, lastName, email, course } = req.body; 

    // SQL query to insert data into the 'students' table (using snake_case in DB)
    const queryText = `
        INSERT INTO students(first_name, last_name, email, course) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
    `;
    const values = [firstName, lastName, email, course];

    try {
        const result = await pool.query(queryText, values);
        console.log('New student registered:', result.rows[0]);
        res.status(201).json({ 
            message: 'Student registered successfully', 
            student: result.rows[0] 
        });
    } catch (err) {
        console.error('Database insertion error:', err.stack);
        res.status(500).json({ 
            message: 'Error registering student', 
            error: err.message 
        });
    }
});

// A. API Route to Fetch All Students (READ: GET /api/student)
app.get('/api/student', async (req, res) => {
    try {
        const queryText = `SELECT * FROM students ORDER BY id ASC;`;
        const result = await pool.query(queryText);
        
        // Send the array of students (in snake_case) back to Angular
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database retrieval error:', err.stack);
        res.status(500).json({ 
        message: 'Error fetching students', 
        error: err.message 
        });
    }
});

// B. API Route to Update a Student (UPDATE: PUT /api/student/:id)
app.put('/api/student/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid student ID provided.' });
    }
    
    const { firstName, lastName, email, course } = req.body; 

    const queryText = 'UPDATE students SET first_name = $2, last_name = $3, email = $4, course = $5 WHERE id = $1 RETURNING *;';
    const values = [id, firstName, lastName, email, course]; 

    try {
        const result = await pool.query(queryText, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Student updated:', result.rows[0]);
        res.status(200).json({ 
            message: 'Student updated successfully', 
            student: result.rows[0] 
        });
    } catch (err) {
        console.error('Database update error:', err.stack);
        res.status(500).json({ 
            message: 'Error updating student', 
            error: err.message 
        });
    }
});

// C. API Route to Delete a Student (DELETE: DELETE /api/student/:id)
app.delete('/api/student/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10); 
        
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid student ID provided for deletion.' });
    }

    try {
        const result = await pool.query('DELETE FROM students WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        res.status(204).send(); 
        
    } catch (error) {
        console.error("Database deletion error:", error); 
        res.status(500).json({ error: 'Failed to delete student due to a server error.' });
    }
});


// 4. Start the server (MUST BE AT THE END AND NOT NESTED)
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});