const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based MySQL client
const app = express();
const port = 3000;

// MySQL connection pool configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'DebateMessages', // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to parse JSON bodies
app.use(express.json());

// Route to create a new debate and its corresponding message table
app.post('/debates', async (req, res) => {
    const { debateId } = req.body;

    try {
        // Call the stored procedure to create the debate message table
        await pool.query('CALL CreateNewDebateTable(?)', [debateId]);
        res.status(200).send('Debate table created successfully');
    } catch (error) {
        console.error('Error creating debate table:', error);
        res.status(500).send('Failed to create debate table');
    }
});

// Route to insert a new message into the debate table
app.post('/messages', async (req, res) => {
    const { debateId, senderId, senderUsername, message } = req.body;

    try {
        const tableName = `DebateMessages_${debateId}`;
        const sql = `INSERT INTO ${tableName} (SenderID, SenderUsername, Message) VALUES (?, ?, ?)`;
        await pool.query(sql, [senderId, senderUsername, message]);
        res.status(200).send('Message added successfully');
    } catch (error) {
        console.error('Error inserting message:', error);
        res.status(500).send('Failed to add message');
    }
});

// Route to fetch all messages for a specific debate
app.get('/messages/:debateId', async (req, res) => {
    const debateId = req.params.debateId;

    try {
        const tableName = `DebateMessages_${debateId}`;
        const sql = `SELECT * FROM ${tableName}`;
        const [rows] = await pool.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Failed to fetch messages');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
