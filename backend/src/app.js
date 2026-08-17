const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { checkDatabaseConnection } = require('./config/database');

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

envPaths.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
});

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const porcinosRoutes = require('./routes/porcinos.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/porcinos', porcinosRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API SIGEPOR funcionando' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

async function startServer() {
  try {
    await checkDatabaseConnection();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
