const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importa os modelos do banco de dados
const Entrada = require('../models/entradaModel');
const Saida = require('../models/saidaModel');

// --- ROTAS PARA ENTRADAS ---

// GET: Buscar todas as entradas
router.get('/entradas', async (req, res) => {
  try {
    const entradas = await Entrada.find().sort({ data: -1 });
    res.json(entradas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Criar uma nova entrada
router.post('/entradas', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const entrada = new Entrada({
      fonte: req.body.fonte,
      valor: req.body.valor,
      data: req.body.data,
      status: req.body.status
    });
    const newEntrada = await entrada.save({ session });

    // Se houver valor, cria o dízimo associado
    if (newEntrada.valor > 0) {
      const dizimo = new Saida({
        descricao: `Dízimo sobre ${newEntrada.fonte}`,
        categoria: 'Dízimo',
        valor: newEntrada.valor * 0.1,
        data: newEntrada.data,
        isCustoNegocio: false,
        status: 'pago', // Dízimo já sai como pago
        entradaId: newEntrada._id // Vincula o dízimo à entrada
      });
      await dizimo.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json(newEntrada);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// PUT: Atualizar uma entrada existente
router.put('/entradas/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const updatedEntrada = await Entrada.findByIdAndUpdate(id, req.body, { new: true, session });

    if (!updatedEntrada) {
      throw new Error('Entrada não encontrada');
    }

    // Atualiza o dízimo correspondente
    const novoValorDizimo = updatedEntrada.valor * 0.1;
    await Saida.findOneAndUpdate(
      { entradaId: updatedEntrada._id },
      { 
        $set: { 
          valor: novoValorDizimo,
          data: updatedEntrada.data,
          descricao: `Dízimo sobre ${updatedEntrada.fonte}`
        } 
      },
      { session }
    );

    await session.commitTransaction();
    res.json(updatedEntrada);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// DELETE: Deletar uma entrada
router.delete('/entradas/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const deletedEntrada = await Entrada.findByIdAndDelete(id, { session });
    
    if (!deletedEntrada) {
        throw new Error('Entrada não encontrada');
    }

    // Deleta o dízimo associado
    await Saida.findOneAndDelete({ entradaId: id }, { session });

    await session.commitTransaction();
    res.json({ message: 'Entrada e dízimo associado deletados com sucesso' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});


// --- ROTAS PARA SAÍDAS ---

// GET: Buscar todas as saídas
router.get('/saidas', async (req, res) => {
  try {
    const saidas = await Saida.find().sort({ data: -1 });
    res.json(saidas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Criar uma nova saída
router.post('/saidas', async (req, res) => {
  const saida = new Saida({
    descricao: req.body.descricao,
    categoria: req.body.categoria,
    valor: req.body.valor,
    data: req.body.data,
    isCustoNegocio: req.body.isCustoNegocio,
    status: req.body.status
  });

  try {
    const newSaida = await saida.save();
    res.status(201).json(newSaida);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Atualizar uma saída existente
router.put('/saidas/:id', async (req, res) => {
  try {
    const updatedSaida = await Saida.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSaida);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Deletar uma saída
router.delete('/saidas/:id', async (req, res) => {
  try {
    await Saida.findByIdAndDelete(req.params.id);
    res.json({ message: 'Saída deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NOVAS ROTAS PARA AÇÕES EM LOTE ---

// DELETE: Deletar múltiplas entradas ou saídas
router.delete('/:type', async (req, res) => {
    const { type } = req.params;
    const { ids } = req.body;
    const Model = type === 'entradas' ? Entrada : Saida;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!ids || !Array.isArray(ids)) {
            throw new Error('IDs inválidos');
        }

        // Se estiver deletando entradas, também deleta os dízimos associados
        if (type === 'entradas') {
            await Saida.deleteMany({ entradaId: { $in: ids } }, { session });
        }
        
        // Garante que dízimos automáticos não sejam deletados diretamente em lote
        if (type === 'saidas') {
             const saidasParaDeletar = await Saida.find({ _id: { $in: ids } });
             const idsValidos = saidasParaDeletar.filter(s => !s.entradaId).map(s => s._id);
             await Saida.deleteMany({ _id: { $in: idsValidos } }, { session });
        } else {
             await Model.deleteMany({ _id: { $in: ids } }, { session });
        }

        await session.commitTransaction();
        res.json({ message: `${ids.length} itens deletados com sucesso.` });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
});


// PUT: Atualizar status de múltiplos itens
router.put('/:type/bulk-status', async (req, res) => {
    const { type } = req.params;
    const { ids, status } = req.body;
    const Model = type === 'entradas' ? Entrada : Saida;

    try {
        if (!ids || !Array.isArray(ids) || !status) {
            throw new Error('Dados inválidos');
        }

        if (type === 'saidas') {
            const saidasParaAtualizar = await Saida.find({ _id: { $in: ids } });
            const idsValidos = saidasParaAtualizar.filter(s => !s.entradaId).map(s => s._id);
            await Model.updateMany({ _id: { $in: idsValidos } }, { $set: { status: status } });
        } else {
            await Model.updateMany({ _id: { $in: ids } }, { $set: { status: status } });
        }
        
        res.json({ message: `${ids.length} itens atualizados para "${status}".` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

