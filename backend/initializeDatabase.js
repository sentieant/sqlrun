const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './queryDatabase.db';
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Students (
        name VARCHAR(100),
        usn VARCHAR(20),
        class VARCHAR(50)
    )`);

    db.run(`INSERT INTO Students (name, usn, class) VALUES ('Aravind', '1', 'A')`);
    db.run(`INSERT INTO Students (name, usn, class) VALUES ('Prajwal', '2', 'B')`);
    db.run(`INSERT INTO Students (name, usn, class) VALUES ('Namratha', '3', 'C')`);
});

db.close();
