
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




// Ruta webhook para Wompi
app.post('/webhook_wompi', (req, res) => {
  try {
    const evento = req.body.event;
    const transaccion = req.body.data?.transaction;

    console.log('⚡ Webhook recibido:');
    console.log(JSON.stringify(req.body, null, 2));

    if (evento === 'transaction.updated' && transaccion) {
      const referencia = transaccion.reference;
      const estado = transaccion.status;

      console.log(`➡️ Pago con referencia ${referencia} cambió a estado: ${estado}`);

      // Aquí puedes guardar en tu BD el estado o hacer acciones
      // Ej: actualizar la orden en PlanetScale o enviar confirmación por email

    } else {
      console.log('❗ Evento no esperado:', evento);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Error procesando webhook:', err);
    res.status(500).send('Error');
  }
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


