const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());

// Ruta para registrar un pago
app.post('/guardar_pago', async (req, res) => {
  const { codigo, valor, estado } = req.body;

  if (!codigo || !valor || !estado) {
    return res.status(400).json({ ok: false, error: 'Faltan datos' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO pagos (codigo, valor, estado) VALUES ($1, $2, $3) RETURNING *',
      [codigo, valor, estado]
    );
    res.json({ ok: true, data: resultado.rows[0] });
  } catch (error) {
    console.error('Error al guardar pago:', error.message);
    res.status(500).json({ ok: false, error: 'Error al guardar el pago' });
  }
});

// Ruta para consultar estado
app.get('/estado_pago/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM pagos WHERE codigo = $1',
      [codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    }

    res.json({ ok: true, data: resultado.rows[0] });
  } catch (error) {
    console.error('Error al consultar pago:', error.message);
    res.status(500).json({ ok: false, error: 'Error al consultar el pago' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
