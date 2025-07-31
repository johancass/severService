const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const DB_FILE = 'pagos.json';

// Utilidad para leer archivo JSON de pagos
function leerPagos() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// Guardar pago
app.post('/guardar_pago', (req, res) => {
  const { id_pago, valor, estado } = req.body;

  if (!id_pago || !valor) {
    return res.status(400).send('Faltan datos');
  }

  const pagos = leerPagos();
  pagos[id_pago] = { valor, estado: estado || 'pendiente' };

  fs.writeFileSync(DB_FILE, JSON.stringify(pagos, null, 2));
  res.json({ status: 'ok', id: id_pago });
});

// Consultar estado
app.get('/estado_pago/:id', (req, res) => {
  const pagos = leerPagos();
  const id = req.params.id;

  if (pagos[id]) {
    res.json({ id, ...pagos[id] });
  } else {
    res.status(404).json({ error: 'Pago no encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
