const mongoose = require('mongoose');

// Define a estrutura (Schema) para os documentos de saída
const saidaSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  isCustoNegocio: {
    type: Boolean,
    default: false
  },
  // Novo campo para o status da saída
  status: {
    type: String,
    required: true,
    enum: ['em aberto', 'pago'],
    default: 'em aberto'
  },
  // Campo para vincular o dízimo à entrada original
  entradaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrada',
    default: null
  }
}, { timestamps: true });

// Cria e exporta o modelo 'Saida' baseado no schema
module.exports = mongoose.model('Saida', saidaSchema);

