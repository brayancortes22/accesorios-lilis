import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const dataDir = path.join(__dirname, 'data');
const productsPath = path.join(dataDir, 'products.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const ordersPath = path.join(dataDir, 'orders.json');

const readJson = (filePath, fallbackValue) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const products = readJson(productsPath, []);
const categories = readJson(categoriesPath, []);
let orders = readJson(ordersPath, []);

const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API de Accesorios Lilis funcionando',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/categories', (_req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (!category || category === 'todos') {
    return res.json(products);
  }

  const filtered = products.filter((product) => product.category === category);
  return res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado.' });
  }

  return res.json(product);
});

app.get('/api/orders', (_req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { clientName, phone, city, items, notes } = req.body;

  if (!clientName || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Faltan datos del cliente o del carrito.',
    });
  }

  const orderItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
  }));

  const total = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const newOrder = {
    id: `PED-${Date.now()}`,
    clientName,
    phone,
    city: city || 'Sin especificar',
    notes: notes || '',
    items: orderItems,
    total,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
  };

  orders = [newOrder, ...orders];
  writeJson(ordersPath, orders);

  return res.status(201).json({
    message: 'Pedido registrado correctamente.',
    order: newOrder,
    totalLabel: formatCurrency(total),
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Accesorios Lilis activo en http://localhost:${PORT}`);
});
