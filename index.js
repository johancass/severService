const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 1000;

//app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz opcional para ver si el servidor responde
app.get('/', (req, res) => {
  res.send('Servidor activo. Usa POST /guardar_pago para enviar datos.');
});

app.post('/crear_pago', async (req, res) => {
  const { id_pago, valor } = req.body;

  if (!id_pago || !valor ) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const estado="pen";
  try {
    // ENVÍA los datos al script PHP de FreeHosting
    const response = await fetch('https://jcmanosenresina.unaux.com/guardar_pago.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        id_pago,
        valor,
        estado
      })
    });

    const respuesta = await response.text();

    console.log('Respuesta desde FreeHosting:', respuesta);

    res.status(200).json({
      exito: true,
      mensaje: 'Datos reenviados correctamente al servidor FreeHosting',
      respuesta_php: respuesta
    });

  } catch (error) {
    console.error('Error al reenviar datos:', error.message);
    res.status(500).json({ error: 'Error al enviar datos a FreeHosting' });
  }
});
// Ruta para recibir los datos del ESP32
app.get('/crear_pago', (req, res) => {
   res.send('Servidor activo. Usa /crear_pagopara enviar datos.');
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
