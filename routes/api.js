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
        
        const query = (type === 'saidas')
            ? { _id: { $in: ids }, entradaId: { $eq: null } } // Garante que dízimos não sejam deletados em lote
            : { _id: { $in: ids } };

        await Model.deleteMany(query, { session });

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

    // Se houver valor e a fonte NÃO FOR 'Ajuste', cria o dízimo associado
    if (newEntrada.valor > 0 && newEntrada.fonte !== 'Ajuste') {
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

    // Busca a entrada original para saber o estado anterior
    const entradaOriginal = await Entrada.findById(id).session(session);
    if (!entradaOriginal) {
      throw new Error('Entrada não encontrada');
    }

    // Atualiza a entrada
    const updatedEntrada = await Entrada.findByIdAndUpdate(id, req.body, { new: true, session });
    if (!updatedEntrada) {
      throw new Error('Falha ao atualizar a entrada');
    }

    const eraAjuste = entradaOriginal.fonte === 'Ajuste';
    const virouAjuste = updatedEntrada.fonte === 'Ajuste';

    // Caso 1: Era uma entrada normal e virou 'Ajuste' -> Deleta dízimo existente
    if (!eraAjuste && virouAjuste) {
      await Saida.findOneAndDelete({ entradaId: updatedEntrada._id }, { session });
    }
    // Caso 2: Era 'Ajuste' e virou uma entrada normal -> Cria um novo dízimo
    else if (eraAjuste && !virouAjuste) {
      if (updatedEntrada.valor > 0) {
        const dizimo = new Saida({
          descricao: `Dízimo sobre ${updatedEntrada.fonte}`,
          categoria: 'Dízimo',
          valor: updatedEntrada.valor * 0.1,
          data: updatedEntrada.data,
          isCustoNegocio: false,
          status: 'pago',
          entradaId: updatedEntrada._id
        });
        await dizimo.save({ session });
      }
    }
    // Caso 3: Era normal e continuou normal -> Atualiza o dízimo existente
    else if (!eraAjuste && !virouAjuste) {
      const novoValorDizimo = updatedEntrada.valor * 0.1;
      const dizimoExistente = await Saida.findOneAndUpdate(
        { entradaId: updatedEntrada._id },
        {
          $set: {
            valor: novoValorDizimo,
            data: updatedEntrada.data,
            descricao: `Dízimo sobre ${updatedEntrada.fonte}`
          }
        },
        { session, upsert: false } // Não cria se não existir
      );

      // Caso de borda: se uma entrada normal não tinha dízimo por algum motivo, cria agora
      if (!dizimoExistente && updatedEntrada.valor > 0) {
        const dizimo = new Saida({
          descricao: `Dízimo sobre ${updatedEntrada.fonte}`,
          categoria: 'Dízimo',
          valor: updatedEntrada.valor * 0.1,
          data: updatedEntrada.data,
          isCustoNegocio: false,
          status: 'pago',
          entradaId: updatedEntrada._id
        });
        await dizimo.save({ session });
      }
    }
    // Caso 4: Era 'Ajuste' e continuou 'Ajuste' -> Não faz nada com o dízimo.

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

module.exports = router;
