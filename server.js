const app = require('./app/index.js'); // Import aplikace z index.js
const punycode = require('punycode');
const { MongoClient } = require('mongodb');
const port = 3000;

// MongoDB connection settings
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'fitnessTracker';

let db;

// ! Connect to MongoDB jeste jsem ji nesetupnul
/*
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then((client) => {
    console.log('Pripojeny k MongoDB');
    db = client.db(dbName); // Set the database reference
  })
  .catch((err) => {
    console.error('Nezdarilo se pripojit k MongoDB', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
*/

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
