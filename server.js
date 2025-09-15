// 1. IMPORTAÇÕES.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Importa as rotas da API
const apiRoutes = require('./routes/api');

// 2. INICIALIZAÇÃO DO APP
const app = express();
const PORT = process.env.PORT || 3000; // Usa a porta definida no ambiente ou 3000

// 3. MIDDLEWARE
app.use(cors()); // Permite que o frontend (de outro endereço) acesse este backend
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(express.static('public')); // Serve os arquivos estáticos (nosso index.html) da pasta 'public'

// 4. ROTAS
// Rota principal da API
app.use('/api', apiRoutes);

// Rota para servir o frontend (qualquer rota não-API serve o index.html)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 5. CONEXÃO COM O BANCO DE DADOS E INICIALIZAÇÃO DO SERVIDOR
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
    // Inicia o servidor APENAS se a conexão com o banco de dados for bem-sucedida
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });


