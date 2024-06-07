const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './queryDatabase.db';
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
    db.run(`CREATE TABLE LOCATIONS (
        loc_id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        loc_description TEXT
    )`);

    const locations = [
        [1, "GJBBASEMENT", "Basement area of the GJB building, known for being dimly lit and isolated, also has a cellar to sell Records/Pink Books"],
        [2, "NISB Room", "Room used by the NISB for storage of sensitive data and other important items"],
        [3, "Prajwal Room", "Room of Prajwal Bhat and Aravind, the Secretary of Events, has belongings of them"],
        [4, "Principal's Office", "Office of the Principal, used for administrative meetings and discussions."],
        [5, "BC Office", "The Office of Branch Counselor of NISB, who is actively guiding the Core team of NISB."],
        [6, "GJB Canteen", "Canteen in the GJB building, a popular spot for informal meetings."],
        [7, "Library", "Quiet area for study and research, frequented by students and staff."],
        [8, "MV Hall", "Hall used for hosting major NISB events and gatherings."],
        [9, "CS Lab", "Laboratory equipped with computers and other technology, used for practical sessions."],
        [10, "Inside NISB Room", "Interior of nisb room"]
    ];

    const stmt = db.prepare("INSERT INTO LOCATIONS (loc_id, name, loc_description) VALUES (?, ?, ?)");

    for (const location of locations) {
        stmt.run(location, (err) => {
            if (err) {
                console.error(`Error inserting row: ${err.message}`);
            }
        });
    }

    stmt.finalize();
});

db.close((err) => {
    if (err) {
        console.error(`Error closing the database: ${err.message}`);
    } else {
        console.log("Database closed successfully.");
    }
});
