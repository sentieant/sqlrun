const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFile = './queryDatabase.db';
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
    db.run(`CREATE TABLE CORES (
        core_id INT PRIMARY KEY,
        core_name VARCHAR(100) NOT NULL,
        core_position VARCHAR(50),
        core_description TEXT
    )`);

    const cores = [
        [1, "Navaneeth", "Chairperson", "Responsible for overall activities and management of NISB and also has special access to IEEE Room."],
        [2, "Susha", "Vice Chairperson", "Assists the Chairperson in overseeing all activities and initiatives and also has special access to IEEE Room."],
        [3, "Prajwal Amte", "Treasurer", "Manages financial transactions and budgeting for the branch."],
        [4, "Smruti", "Secretary of Internal Affairs", "Coordinates internal communications and documentation."],
        [5, "Aravind", "Secretary of Events", "Responsible for creative artifacts used for decoration, also the roommate of Prajwal Bhat."],
        [6, "Prajwal Bhat", "Secretary of Events", "Co-organizes events, known for meticulous planning also RAS Sec, also the roommate of Aravind."],
        [7, "Haripriya", "Technology Coordinator", "Handles technology-related tasks and manages IT infrastructure. She has access to all Tech Repo."],
        [8, "Nagarjun", "Technology Coordinator", "Supports the technology coordinator in technical matters. He has access to all Tech repo."],
        [9, "Vindhya", "Secretary of Membership Development", "Develops strategies to increase membership and engagement."],
        [10, "Bimbika", "Secretary of Marketing and Publicity", "Manages marketing strategies and promotional activities."],
        [11, "Bhoomika", "Secretary of Marketing and Publicity", "Assists in marketing and publicity initiatives."],
        [12, "Navya", "Student Activities Committee Coordinator", "Has the list of RP (Resource Persons) and communicates with them"],
        [13, "Akhil", "Sponsorship Coordinator", "Secures sponsorships and funding for events and activities."],
        [14, "Nidhi", "Editor-in-Chief", "Is responsible for the MANAS, the newsletter"],
        [15, "Ashrith", "CS Chairperson", "Leads the CS and coordinates related activities."],
        [16, "Antriksh", "CS Secretary", "Supports the CS Chairperson in organizing events and activities."],
        [17, "Deepashri", "CASS Chairperson", "Leads the CASS, focusing on CASS activities."],
        [18, "Ananya", "CASS Secretary", "Assists the CASS Chairperson in planning and executing events."],
        [19, "Namratha", "WIE Chairperson", "Heads the WIE group and coordinates their activities."],
        [20, "Sahana", "WIE Secretary", "Supports the WIE Chairperson in organizing events and initiatives."],
        [21, "Afreen", "RAS Chairperson", "Leads the RAS and its activities."],
        [22, "Nameesh", "GRSS Chairperson", "Leads the GRSS."],
        [23, "Nandagopal", "GRSS Secretary", "Assists the GRSS Chairperson in organizing events."]
    ];

    const stmt = db.prepare("INSERT INTO CORES (core_id, core_name, core_position, core_description) VALUES (?, ?, ?, ?)");

    for (const core of cores) {
        stmt.run(core, (err) => {
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
