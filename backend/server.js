require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'NISB559';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const userDb = new sqlite3.Database('./userDatabase.db', (err) => {
    if (err) {
        console.error('Error connecting to user database:', err.message);
    } else {
        console.log('Connected to the User Database');
    }
});

const queryDb = new sqlite3.Database('./queryDatabase.db', (err) => {
    if (err) {
        console.error('Error connecting to query database:', err.message);
    } else {
        console.log('Connected to the Query Database');
    }
});

userDb.run(`CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    points INTEGER DEFAULT 0
)`);

userDb.run(`CREATE TABLE IF NOT EXISTS executed_queries(
    user_id INTEGER,
    query TEXT,
    PRIMARY KEY (user_id, query),
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

const queryPoints = {
    "SELECT * FROM GJBBASEMENT": 100,
    "SELECT * FROM SOEROOM": 100,
    "SELECT * FROM BAGITEMS": 200,
    "SELECT * FROM TIMETABLE": 200,
    "SELECT * FROM ACCESSNISB": 200,
    "SELECT * FROM TECHLOGS": 200,
    "SELECT * FROM HARIPRIYALOGS": 300,
    "SELECT * FROM PARKINGLOT": 300
};

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    userDb.run(`INSERT INTO user (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
        if (err) {
            console.error('Error during registration:', err.message);
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    userDb.get(`SELECT * FROM user WHERE username = ?`, [username], (err, user) => {
        if (err) {
            console.error('Error during login:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            console.warn('Invalid login attempt for username:', username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    if (!authHeader) {
        console.log('Authorization header is missing');
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
        console.log('Bearer token is missing');
        return res.status(401).json({ error: 'Bearer token is missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Invalid token:', err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        console.log('User authenticated:', user);
        next();
    });
}

function isManipulativeQuery(sql) {
    //const forbiddenCommands = ["CREATE", "DROP", "UPDATE", "ALTER", "INSERT"];
    const forbiddenCommands = ["UPDATE", "ALTER"];
    const regex = new RegExp(`\\b(${forbiddenCommands.join('|')})\\b`, 'i');
    return regex.test(sql);
}

app.post('/api/query', authenticateToken, (req, res) => {
    const { sql } = req.body;
    const userId = req.user.id;

    console.log('Received SQL query:', sql);

    if (isManipulativeQuery(sql)) {
        console.warn('Attempted to execute a forbidden query:', sql);
        return res.status(403).json({ error: "YOU CAN'T MANIPULATE THE DATABASE" });
    }

    queryDb.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ error: 'Error executing query', details: err.message });
        }
        
        const normalizedSql = sql.trim().toUpperCase();
        const points = queryPoints[normalizedSql];

        if (points) {
            userDb.get(`SELECT * FROM executed_queries WHERE user_id = ? AND query = ?`, [userId, normalizedSql], (err, record) => {
                if (err) {
                    console.error('Error checking executed queries:', err.message);
                    return res.status(500).json({ error: 'Error checking executed queries', details: err.message });
                }

                if (!record) {
                    userDb.run(`INSERT INTO executed_queries (user_id, query) VALUES (?, ?)`, [userId, normalizedSql], (err) => {
                        if (err) {
                            console.error('Error recording executed query:', err.message);
                            return res.status(500).json({ error: 'Error recording executed query', details: err.message });
                        }

                        userDb.run(`UPDATE user SET points = points + ? WHERE id = ?`, [points, userId], (err) => {
                            if (err) {
                                console.error('Error updating user points:', err.message);
                                return res.status(500).json({ error: 'Error updating user points', details: err.message });
                            }

                            res.json({ results: rows, pointsAwarded: points });
                        });
                    });
                } else {
                    res.json({ results: rows, pointsAwarded: 0, message: 'Points for this query have already been awarded.' });
                }
            });
        } else {
            res.json({ results: rows });
        }
    });
});

app.get('/api/users-info', authenticateToken, (req, res) => {
    if (req.user.username !== 'your_username') { 
        return res.status(403).json({ error: 'Access denied' });
    }

    userDb.all(`SELECT username, points FROM user`, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users info:', err.message);
            return res.status(500).json({ error: 'Error fetching users info', details: err.message });
        }
        res.json({ users: rows });
    });
});

app.get('/api/test-database-connection', (req, res) => {
    queryDb.all('SELECT 1', [], (err, rows) => {
        if (err) {
            console.error('Error testing database connection:', err.message);
            return res.status(500).json({ error: 'Error testing database connection' });
        }
        res.json({ message: 'Database connection test successful' });
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
