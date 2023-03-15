const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql');

app.use(cors());

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'esat_db'
});

app.get('/users', (req, res) => {
  connection.query('SELECT GEO_LCTN FROM esat_db.users', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(results);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});