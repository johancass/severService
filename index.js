
const express = require('express');
const pool = require('./db');
const axios = require('axios');
cconst cors = require('cors');
onst crypto = require('crypto');
const app = express();


app.use(cors()); // Permitir cualquier origen temporalmente
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ para datos tipo formulario

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
// server.js


app.post('/generar_pago', async (req, res) => {
  const { referenceCode, amount } = req.body;

  const apiKey = '4Vj8eK4rloUd272L48hsrarnUA';
  const merchantId = '508029';
  const accountId = '512321';
  const currency = 'COP';

  const signatureString = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');

  const payload = {
    language: 'es',
    command: 'SUBMIT_TRANSACTION',
    merchant: {
      apiKey,
      apiLogin: 'pRRXKOl8ikMmt9u',
    },
    transaction: {
      order: {
        accountId,
        referenceCode,
        description: 'Prueba desde PHP',
        language: 'es',
        signature,
        notifyUrl: 'https://jcmanosenresina.unaux.com/verificar.php',
        additionalValues: {
          TX_VALUE: {
            value: amount,
            currency
          }
        },
        buyer: {
          fullName: 'Cliente Test',
          emailAddress: 'cliente@test.com',
          contactPhone: '3000000000',
          dniNumber: '123456789',
          shippingAddress: {
            street1: 'Calle 1',
            city: 'Bogotá',
            state: 'Bogotá',
            country: 'CO',
            phone: '3000000000'
          }
        }
      },
      payer: {
        fullName: 'Cliente Test',
        emailAddress: 'cliente@test.com',
        contactPhone: '3000000000',
        dniNumber: '123456789',
        billingAddress: {
          street1: 'Calle 1',
          city: 'Bogotá',
          state: 'Bogotá',
          country: 'CO',
          phone: '3000000000'
        }
      },
      type: 'AUTHORIZATION_AND_CAPTURE',
      paymentMethod: 'NEQUI',
      paymentCountry: 'CO',
      deviceSessionId: 'abc123',
      ipAddress: '127.0.0.1',
      cookie: 'cookie123456',
      userAgent: 'Mozilla/5.0'
    },
    test: true
  };

  try {
    const response = await axios.post(
      'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message, detalle: err.response?.data });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});


