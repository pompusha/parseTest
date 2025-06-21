const Database = require("better-sqlite3");

function saveTyresToDb(data) {
  const db = new Database("tyres.db");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tyres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website TEXT,
      brand TEXT,
      size TEXT,
      aspect_ratio TEXT,
      radius TEXT,
      price TEXT,
      season TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO tyres (website, brand, size, aspect_ratio, radius, price, season)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tyre of data) {
    insert.run(
      tyre.website,
      tyre.brend,
      tyre.size,
      tyre.aspect_ratio,
      tyre.radius,
      tyre.price,
      tyre.season
    );
  }

  console.log("Data successfully saved to tyres.db database");
}

module.exports = saveTyresToDb;
