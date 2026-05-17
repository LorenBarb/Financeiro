const mongoose = require('mongoose');
const Entrada = require('../models/entradaModel');
const Saida = require('../models/saidaModel');

exports.listar = async (req, res, next) => {
  try {
    const saidas = await Saida.find().sort({ data: -1 });
    res.json(saidas);
  } catch (err) {
    next(err);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const { descricao, categoria, valor, data, isCustoNegocio, status } = req.body;
    const saida = new Saida({ descricao, categoria, valor, data, isCustoNegocio, status });
    const newSaida = await saida.save();
    res.status(201).json(newSaida);
  } catch (err) {
    next(err);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const updatedSaida = await Saida.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSaida) {
      return res.status(404).json({ message: 'Saída não encontrada' });
    }
    res.json(updatedSaida);
  } catch (err) {
    next(err);
  }
};

exports.deletar = async (req, res, next) => {
  try {
    const deleted = await Saida.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Saída não encontrada' });
    }
    res.json({ message: 'Saída deletada com sucesso' });
  } catch (err) {
    next(err);
  }
};

exports.atualizarStatusEmLote = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { ids, status } = req.body;
    const Model = type === 'entradas' ? Entrada : Saida;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    if (type === 'saidas') {
      const saidasParaAtualizar = await Saida.find({ _id: { $in: ids } });
      const idsValidos = saidasParaAtualizar.filter(s => !s.entradaId).map(s => s._id);
      await Model.updateMany({ _id: { $in: idsValidos } }, { $set: { status } });
    } else {
      await Model.updateMany({ _id: { $in: ids } }, { $set: { status } });
    }

    res.json({ message: `${ids.length} itens atualizados para "${status}".` });
  } catch (err) {
    next(err);
  }
};

exports.deletarEmLote = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { type } = req.params;
    const { ids } = req.body;
    const Model = type === 'entradas' ? Entrada : Saida;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    if (type === 'entradas') {
      await Saida.deleteMany({ entradaId: { $in: ids } }, { session });
    }

    const query = (type === 'saidas')
      ? { _id: { $in: ids }, entradaId: { $eq: null } }
      : { _id: { $in: ids } };

    await Model.deleteMany(query, { session });
    await session.commitTransaction();
    res.json({ message: `${ids.length} itens deletados com sucesso.` });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
