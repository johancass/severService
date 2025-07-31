// db.js
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'sql201.byetcluster.com',
  user: 'TU_USUARIO',
  password: 'TU_PASSWORD',
  database: 'ezyro_39500373_datacont',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = connection
