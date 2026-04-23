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

// Nastavení sezení (sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));

// Middleware pro flash zprávy
app.use(require('./middleware/flash'));

// Servírování statických souborů
app.use(express.static(path.join(__dirname, 'public')));

// Servírování nahrávaných fotografií (zabezpečeno kontrolou sezení)
app.get('/uploads/photos/:filename', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Not authorized');
  }
  // Použití kořenového adresáře uploads
  res.sendFile(path.join(__dirname, '../uploads/photos', req.params.filename));
});

// Inicializace cest (routes)
app.use('/', indexRouter);
app.use('/user/', userRouter);
// Připojení k MongoDB a následné spuštění serveru
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
