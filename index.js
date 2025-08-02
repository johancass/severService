
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
// Ruta directa: /estado_pago?ref=XXXXXX
app.get('/estado_pago', async (req, res) => {
  const referencia = req.query.ref;

  if (!referencia) {
    return res.status(400).json({ error: 'Referencia requerida' });
  }

  const url = 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi'; // cambia a producción si aplica

  const body = {
    test: false,
    language: 'es',
    command: 'ORDER_DETAIL_BY_REFERENCE_CODE',
    merchant: {
      apiKey: API_KEY,
      apiLogin: API_LOGIN
    },
    details: {
      referenceCode: referencia
    }
  };

  try {
    const respuesta = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    const resultado = respuesta.data;

    if (!resultado.result || !resultado.result.payload) {
      return res.status(404).json({ estado: 'NO_ENCONTRADO' });
    }

    const pago = resultado.result.payload;
    const estadoPago = pago.transactions?.[0]?.transactionResponse?.state || 'PENDING';

    return res.json({ estado: estadoPago });
  } catch (err) {
    console.error('Error al consultar estado:', err.message);
    return res.status(500).json({ error: 'Error al consultar el estado del pago' });
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

const merchantId = "1018562"; // Tu merchantId real
const accountId = "1027555";  // Tu accountId real
const apiKey = "I29W9AhcDED95Gzg80k87YzinF";     // Tu apiKey real
const currency = "COP";
const urlResponse = "https://jcmanosenresina.unaux.com/verificar.php";
const urlConfirmation = "https://jcmanosenresina.unaux.com/confirmacion.php";

app.post("/generar_pago", (req, res) => {
  const { referenceCode, amount, buyerEmail } = req.body;

  const signature = crypto
    .createHash("md5")
    .update(`${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`)
    .digest("hex");

  const htmlForm = `
   <form id="payuForm" method="post" action="https://checkout.payulatam.com/ppp-web-gateway-payu">
      <input name="merchantId"    type="hidden"  value="${merchantId}">
      <input name="accountId"     type="hidden"  value="${accountId}">
      <input name="description"   type="hidden"  value="Pago desde Web">
      <input name="referenceCode" type="hidden"  value="${referenceCode}">
      <input name="amount"        type="hidden"  value="${amount}">
      <input name="tax"           type="hidden"  value="0">
      <input name="taxReturnBase" type="hidden"  value="0">
      <input name="currency"      type="hidden"  value="${currency}">
      <input name="signature"     type="hidden"  value="${signature}">
      <input name="test"          type="hidden"  value="0">
      <input name="buyerEmail"    type="hidden"  value="${buyerEmail}">
      <input name="responseUrl"   type="hidden"  value="${urlResponse}">
      <input name="confirmationUrl" type="hidden" value="${urlConfirmation}">
    </form>
    <script>document.getElementById('payuForm').submit();</script>
  `;

  res.send(htmlForm);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});


