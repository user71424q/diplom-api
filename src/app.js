require('dotenv').config();
const express = require('express');
const app = express();
const apiRoutes = require('./routes/apiRoutes');

app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

module.exports = server;