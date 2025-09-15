const mongoose = require('mongoose');

// Define a estrutura (Schema) para os documentos de entrada
const entradaSchema = new mongoose.Schema({
  fonte: {
    type: String,
    required: true,
    enum: ['iFood', 'Uber', '99', 'Outro'] // Garante que a fonte seja um desses valores
  },
  valor: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'repassado'],
    default: 'pendente'
  }
}, { timestamps: true }); // timestamps adiciona createdAt e updatedAt automaticamente

// Cria e exporta o modelo 'Entrada' baseado no schema
module.exports = mongoose.model('Entrada', entradaSchema);

