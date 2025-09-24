const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importa os modelos do banco de dados
const Entrada = require('../models/entradaModel');
const Saida = require('../models/saidaModel');


// --- ROTAS PARA AÇÕES EM LOTE ---
// Estas rotas precisam ser declaradas ANTES das rotas com /:id para evitar conflitos.

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
            // Garante que dízimos automáticos não tenham seu status alterado em lote
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

        if (type === 'entradas') {
            // Ao deletar entradas, também deleta os dízimos associados
            await Saida.deleteMany({ entradaId: { $in: ids } }, { session });
        }
        
        if (type === 'saidas') {
             // Garante que dízimos automáticos não sejam deletados em lote por esta rota
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


// --- ROTAS PARA ENTRADAS ---

// GET: Buscar todas as entradas
router.get('/entradas', async (req, res) => {
// ... existing code ...
router.delete('/entradas/:id', async (req, res) => {
// ... existing code ...
  }
});


// --- ROTAS PARA SAÍDAS ---

// GET: Buscar todas as saídas
router.get('/saidas', async (req, res) => {
// ... existing code ...
  }
});

// POST: Criar uma nova saída
// ... existing code ...
router.delete('/saidas/:id', async (req, res) => {
  try {
// ... existing code ...
    res.status(500).json({ message: err.message });
  }
});

// --- ROTAS PARA AÇÕES EM LOTE ---

// DELETE: Deletar múltiplas entradas ou saídas
router.delete('/:type', async (req, res) => {
    const { type } = req.params;
// ... existing code ...
    const { ids } = req.body;
    const Model = type === 'entradas' ? Entrada : Saida;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!ids || !Array.isArray(ids)) {
            throw new Error('IDs inválidos');
        }

        if (type === 'entradas') {
            await Saida.deleteMany({ entradaId: { $in: ids } }, { session });
        }
        
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
