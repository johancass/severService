
const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
// Middleware para que acepte JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ para datos tipo formulario
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor activo' });
});


// Endpoint para firmar datos de Wompi
app.post('/firmar_wompi', (req, res) => {
  const {
    reference,
    amount_in_cents,
    currency,
    public_key
  } = req.body;

  // Clave secreta desde variable de entorno (más seguro)
  const integrity_key = process.env.WOMPI_SECRET_KEY;

  if (!reference || !amount_in_cents || !currency || !public_key || !integrity_key) {
    return res.status(400).json({ ok: false, error: 'Faltan parámetros o clave secreta' });
  }

  try {
    const cadena = `${reference}${amount_in_cents}${currency}${public_key}${integrity_key}`;
    const hash = crypto.createHash('sha256').update(cadena).digest('hex');
    res.json({ ok: true, signature: hash });
  } catch (err) {
    console.error('Error generando firma:', err);
    res.status(500).json({ ok: false, error: 'Error interno generando firma' });
  }
});




app.post('/webhook_wompi', express.json(), async (req, res) => {
  const evento = req.body;

  if (!evento || !evento.data || !evento.data.transaction) {
    return res.status(400).send('Evento inválido');
  }

  const transaccion = evento.data.transaction;
  const estado = transaccion.status; // Ej: APPROVED, DECLINED, etc.
  const referencia = transaccion.reference;

  console.log('Webhook recibido de Wompi:');
  console.log('Referencia:', referencia);
  console.log('Estado:', estado);

  // Solo actualiza si el pago fue exitoso
  const update = await pool.query(
        'UPDATE pagos SET estado = $1 WHERE codigo = $2',
        ['pagado', estado]
      );

  res.sendStatus(200); // Wompi espera esta respuesta
});

// Ruta para registrar un pago
app.post('/crear_pago', async (req, res) => {
  const { id_pago, valor } = req.body;
 const estado="pendiente";
  if (!id_pago || !valor) {
    return res.status(400).json({ ok: false, error: 'Faltan datos' });
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
console.log("Tu variable:", process.env.DATABASE_URL);
 try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ ok: true, hora: resultado.rows[0] });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});
// Ruta para consultar estado
app.get('/estado_pago', async (req, res) => {
  const codigo = req.query.codigoin;

  console.log('REQ QUERY:', req.query);
  console.log('Código recibido:', codigo);

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

    console.log('Resultado:', resultado.rows);

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




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});


