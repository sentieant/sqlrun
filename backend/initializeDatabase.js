const sqlite3 = require('sqlite3').verbose();

const dbFile = './queryDatabase.db';

// Connect to the database
const db = new sqlite3.Database(dbFile);

// Function to clear all tables
function clearAllTables() {
    return new Promise((resolve, reject) => {
        // Get all table names
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Loop through each table and delete all data
            tables.forEach(({ name }) => {
                db.run(`DELETE FROM ${name}`, (err) => {
                    if (err) {
                        console.error(`Error clearing table ${name}: ${err.message}`);
                    } else {
                        console.log(`Cleared table ${name}`);
                    }
                });
            });

            resolve();
        });
    });
}

// Call the function to clear all tables
clearAllTables()
    .then(() => {
        console.log('All tables cleared successfully');
    })
    .catch((err) => {
        console.error('Error clearing tables:', err);
    })
    .finally(() => {
        // Close the database connection
        db.close();
    });
