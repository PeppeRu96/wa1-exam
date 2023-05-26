'use strict';

const sqlite = require('sqlite3');
console.log(__dirname);
const DB_PATH = (__dirname + '/../surveys.sqlite');

// open the database
const db = new sqlite.Database(DB_PATH, (err) => {
  if (err) throw err;

  console.log("Local DB successfully connected.");
});

module.exports = db;