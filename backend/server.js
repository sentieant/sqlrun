const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = 'NISB559'
app.use(cors());
app.use(bodyParser.json());

const userDb= new sqlite3.Database('./userDatabase.db', (err)=>{
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the User Database');
});
const queryDb= new sqlite3.Database('./queryDatabase.db', (err)=>{
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the Query Database');
});

userDb.run(`CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    points INTEGER DEFAULT 0
)`);

app.post('/api/register', (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    userDb.run(`INSERT INTO users (username, password) values (?, ?)`, [username, hashedPassword], function(err){
        if(err){
            return res.status(400).json({error: err.message})
        }
    });
});




