const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 7287;

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
app.use(bodyParser.json());

// Example route for login
app.post('/api/Auth/login', (req, res) => {
  const { UserName, Password } = req.body;
  // Handle login logic and send a response
  res.json({ token: 'example-jwt-token' });
});

// Example route for registration
app.post('/api/Users', (req, res) => {
  const registerData = req.body;
  // Handle registration logic and send a response
  res.json({ message: 'Registration successful' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
