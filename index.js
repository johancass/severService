// index.js
const express = require('express');
const db = require('./db'); // ← conexión a la base de datos
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint para guardar un nuevo pago
app.post('/crear_pago', async (req, res) => {
  const { id_pago, valor } = req.body;
  const estado = 'pendiente';

  if (!id_pago || !valor) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const sql = 'INSERT INTO pagos (id_pago, valor, estado) VALUES (?, ?, ?)';
    await db.query(sql, [id_pago, valor, estado]);
    res.json({ exito: true, mensaje: 'Pago guardado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, error: 'Error al guardar en base de datos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
// Ruta para recibir los datos del ESP32
app.get('/crear_pago', (req, res) => {
   res.send('Servidor activo. Usa /crear_pagopara enviar datos.');
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
