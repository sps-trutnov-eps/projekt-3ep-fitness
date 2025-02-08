const express = require('express');
const bodyParser = require('body-parser');
const indexRouter = require('./routers/indexRouter');
const connectDB = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Server static files
app.use(express.static('www'));

// Initialize routes
app.use('/', indexRouter);

// Connect to MongoDB and then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
