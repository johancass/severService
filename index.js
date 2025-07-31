const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 1000;

app.use(bodyParser.json());

// Ruta para recibir los datos del ESP32
app.post('/crear_pago', (req, res) => {
   res.send('Servidor activo. Usa /crear_pagopara enviar datos.');
});

// Ruta raíz opcional para ver si el servidor responde
app.get('/', (req, res) => {
  res.send('Servidor activo. Usa POST /guardar_pago para enviar datos.');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
