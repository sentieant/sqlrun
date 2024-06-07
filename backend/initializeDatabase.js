const sqlite3 = require('sqlite3').verbose();

// Define the database file path
const dbFile = './queryDatabase.db';

// Connect to the database
const db = new sqlite3.Database(dbFile);

// Define the table creation SQL query
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS LOCATION (
        loc_id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        loc_description TEXT
    )
`;

// Define the data to be inserted into the LOCATION table
const locationData = [
    [1, "GJBBASEMENT", "Basement area of the GJB building, known for being dimly lit and isolated, also has a cellar to sell Records/Pink Books"],
    [2, "NISB Room", "Room used by the NISB for storage of sensitive data and other important items"],
    [3, "Prajwal Room", "Room of Prajwal Bhat and Aravind, the Secretary of Events, has belongings of them"],
    [4, "Principals Office", "Office of the Principal, used for administrative meetings and discussions."],
    [5, "BC Office", "The Office of Branch Counselor of NISB, who is actively guiding the Core team of NISB."],
    [6, "GJB Canteen", "Canteen in the GJB building, a popular spot for informal meetings."],
    [7, "Library", "Quiet area for study and research, frequented by students and staff."],
    [8, "MV Hall", "Hall used for hosting major NISB events and gatherings."],
    [9, "CS Lab", "Laboratory equipped with computers and other technology, used for practical sessions."],
    [10, "Inside NISB Room", "Interior of NISB room"]
];

// Insert data into the LOCATION table
db.serialize(() => {
    // Create the LOCATION table if it doesn't exist
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating LOCATION table:', err.message);
            return;
        }
        console.log('LOCATION table created successfully.');

        // Insert data into the LOCATION table
        const insertDataQuery = 'INSERT INTO LOCATION (loc_id, name, loc_description) VALUES (?, ?, ?)';
        const stmt = db.prepare(insertDataQuery);

        locationData.forEach((row) => {
            stmt.run(row, (err) => {
                if (err) {
                    console.error(`Error inserting row: ${err.message}`);
                }
            });
        });

        stmt.finalize();
        console.log('Data inserted into LOCATION table.');
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    } else {
        console.log('Database connection closed successfully.');
    }
});
