
const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ para datos tipo formulario

// Ruta para registrar un pago
app.post('/crear_pago', async (req, res) => {
  const codigo = req.query.codigo || req.body.codigo;

 const estado="pendiente";
  if (!id_pago || !valor) {
return res.status(404).json({ ok: false, mensaje: `Código ${codigo} no encontrado` });

  }

  try {
    const resultado = await pool.query(
      'INSERT INTO pagos (codigo, valor, estado) VALUES ($1, $2, $3) RETURNING *',
      [id_pago, valor, estado]
    );
    res.json({ ok: true, data: resultado.rows[0] });
  } catch (error) {
    console.error('Error al guardar pago:', error.message);
    res.status(500).json({ ok: false, error: 'Error al guardar el pago' });
  }
});
app.get('/test_db', async (req, res) => {
 try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ ok: true, hora: resultado.rows[0] });
  } catch (err) {
    res.json({ ok: false, error: err.message});

  }
});
app.get('/ver_env', (req, res) => {
  res.json({ database_url: process.env.DATABASE_URL });
});
// Ruta para consultar estado
app.get('/estado_pago', async (req, res) => {
  const codigo = req.query.codigoin;

  if (!codigo) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Falta el parámetro "codigoin"'
    });
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM pagos WHERE codigo = $1',
      [codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: `Código "${codigo}" no encontrado`
      });
    }

    res.json({
      ok: true,
      data: resultado.rows[0]
    });

  } catch (error) {
    console.error('Error al consultar el pago:', error.message);
    res.status(500).json({
      ok: false,
      error: 'Error al consultar el pago'
    });
  }
});


