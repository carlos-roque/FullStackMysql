const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 8080;

// Database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

// Create a connection pool
let pool;

async function initializePool() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Connected to MySQL database!');
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        process.exit(1);
    }
}

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Define a route to get all cars
app.get('/api/cars', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cars');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching cars:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error SQL state:', error.sqlState);
        console.error('Error SQL:', error.sql);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// Add a route to handle adding new cars (POST request)
app.post('/api/cars', async (req, res) => {
    const { carName, model } = req.body;

    if (!carName || !model) {
        return res.status(400).json({ error: 'Car name and model are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO cars (car_name, model) VALUES (?, ?)',
            [carName, model]
        );
        res.status(201).json({ message: 'Car added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding car:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error SQL state:', error.sqlState);
        console.error('Error SQL:', error.sql);
        res.status(500).json({ error: 'Failed to add car' });
    }
});

// Delete a car by ID
app.delete('/api/cars/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM cars WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.status(204).send(); // 204 No Content (successful deletion)
    } catch (error) {
        console.error('Error deleting car:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error SQL state:', error.sqlState);
        console.error('Error SQL:', error.sql);
        res.status(500).json({ error: 'Failed to delete car' });
    }
});

// Update a car by ID
app.put('/api/cars/:id', async (req, res) => {
    const { id } = req.params;
    const { carName, model } = req.body;

    if (!carName || !model) {
        return res.status(400).json({ error: 'Car name and model are required' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cars SET car_name = ?, model = ? WHERE id = ?',
            [carName, model, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.status(200).json({ message: 'Car updated successfully' });
    } catch (error) {
        console.error('Error updating car:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error SQL state:', error.sqlState);
		console.error('Error SQL:', error.sql);
        res.status(500).json({ error: 'Failed to update car' });
    }
});

// Start the server
async function startServer() {
    await initializePool();
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

startServer();