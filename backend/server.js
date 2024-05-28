const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = 'NISB559';
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
    const token = req.headers['authorization'];
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

app.post('/api/query', authenticateToken, (req, res) => {
    const {sql} = req.body;

    query.Db.all(sql, [], (err, rows) => {
        if(err){
            res.status(400).json({error: err.message});
            return;
        }

        res.json({rows});
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
