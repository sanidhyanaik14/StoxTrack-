const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const pool = require('./db'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'stockwatch_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, password]
    );

    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (user.rows.length > 0) {
      req.session.user = {
        name: user.rows[0].name,
        email: user.rows[0].email
      };
      res.redirect('/index.html');
    } else {
      res.send('<script>alert("Invalid credentials!"); window.location.href = "/login.html";</script>');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      res.status(500).send("Logout failed");
    } else {
      res.redirect('/index.html');
    }
  });
});

// user's current session
app.get('/session-user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});




//notes database connectivity 
app.post('/api/save-note', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please login first to save notes' });
  }

  const { content } = req.body;
  const email = req.session.user.email;

  try {
    const user = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const userId = user.rows[0].id;

    await pool.query(
      'INSERT INTO notes (user_id, content) VALUES ($1, $2)',
      [userId, content]
    );

    res.status(200).json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Please login to save notes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Fetch saved notes
app.get('/api/notes', async (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const userRes = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [req.session.user.email]
    );

    const userId = userRes.rows[0].id;

    const notesRes = await pool.query(
      'SELECT content, created_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(notesRes.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




