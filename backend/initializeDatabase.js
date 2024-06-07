const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './queryDatabase.db';
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
    db.run(`CREATE TABLE GJBBASEMENT(
        item_id INT PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        item_description TEXT
    )`);

    const gjbbasementItems = [
        [1, "BDC Certificate", "The certificates, which hold huge value to those who donated Blood in NISB WiE’s Blood Donation Camp, in a peculiar place!!"],
        [2, "RP List", "The list of Resource Persons (RP) for CASS Events, what is it doing beside Prajwal’s Dead Body!!"],
        [3, "MANAS Newsletter", "The original and the only copy of newsletter MANAS, how is it here!!"],
        [4, "Prajwal’s Dead Body", "Dead body of the Secretary of Events of NISB"],
        [5, "Scizzors", "The Scissors used to make creative artifacts, is the murder weapon!!"]
    ];

    const stmt = db.prepare("INSERT INTO GJBBASEMENT(item_id, item_name, item_description) VALUES (?, ?, ?)");

    for (const item of gjbbasementItems) {
        stmt.run(item, (err) => {
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
