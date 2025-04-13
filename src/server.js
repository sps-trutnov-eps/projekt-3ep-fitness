const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const indexRouter = require('./routers/indexRouter');
const userRouter = require('./routers/userRouter');
const connectDB = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Setup sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));

// Flash messages middleware
app.use(require('./middleware/flash'));

// Server static files
app.use(express.static('www'));

// Serve uploaded photos (secured by session check)
app.get('/uploads/photos/:filename', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Not authorized');
  }
  // Changed to use the root uploads directory
  res.sendFile(path.join(__dirname, '../uploads/photos', req.params.filename));
});

// Initialize routes
app.use('/', indexRouter);
app.use('/user/', userRouter);
// Connect to MongoDB and then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
