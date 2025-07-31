// index.js

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configura tu base de datos (usa tus datos de ByetHost)
const dbConfig = {
  host: 'sql201.byetcluster.com',
  user: 'ezyro_39500373',
  password: '35e8e5231a7', // ← reemplaza esto
  database: 'ezyro_39500373_datacont',
};



// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor activo. Usa POST en /crear_pago para guardar pagos.');
});

// Ruta para guardar el pago
app.post('/crear_pago', async (req, res) => {
  const { id_pago, valor } = req.body;
  const estado = 'pendiente';

  // Validación básica
  if (!id_pago || !valor) {
    return res.status(400).json({ exito: false, mensaje: 'Faltan datos', recibido: req.body });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'INSERT INTO pagos (id_pago, valor, estado) VALUES (?, ?, ?)';
    await connection.execute(sql, [id_pago, valor, estado]);
    await connection.end();

    res.json({ exito: true, mensaje: 'Pago guardado exitosamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar:', error.message);
    res.status(500).json({ exito: false, mensaje: 'Error al guardar en la base de datos.' });
  }
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
