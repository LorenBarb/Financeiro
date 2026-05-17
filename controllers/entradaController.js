const mongoose = require('mongoose');
const Entrada = require('../models/entradaModel');
const Saida = require('../models/saidaModel');

exports.listar = async (req, res, next) => {
  try {
    const entradas = await Entrada.find().sort({ data: -1 });
    res.json(entradas);
  } catch (err) {
    next(err);
  }
};

exports.criar = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fonte, valor, data, status } = req.body;
    const entrada = new Entrada({ fonte, valor, data, status });
    const newEntrada = await entrada.save({ session });

    if (newEntrada.valor > 0 && newEntrada.fonte !== 'Ajuste') {
      const dizimo = new Saida({
        descricao: `Dízimo sobre ${newEntrada.fonte}`,
        categoria: 'Dízimo',
        valor: newEntrada.valor * 0.1,
        data: newEntrada.data,
        isCustoNegocio: false,
        status: 'pago',
        entradaId: newEntrada._id
      });
      await dizimo.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json(newEntrada);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.atualizar = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const entradaOriginal = await Entrada.findById(id).session(session);
    if (!entradaOriginal) {
      return res.status(404).json({ message: 'Entrada não encontrada' });
    }

    const updatedEntrada = await Entrada.findByIdAndUpdate(id, req.body, { new: true, session });
    if (!updatedEntrada) {
      throw new Error('Falha ao atualizar a entrada');
    }

    const eraAjuste = entradaOriginal.fonte === 'Ajuste';
    const virouAjuste = updatedEntrada.fonte === 'Ajuste';

    if (!eraAjuste && virouAjuste) {
      await Saida.findOneAndDelete({ entradaId: updatedEntrada._id }, { session });
    } else if (eraAjuste && !virouAjuste) {
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
    } else if (!eraAjuste && !virouAjuste) {
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
        { session, upsert: false }
      );

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

    await session.commitTransaction();
    res.json(updatedEntrada);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.deletar = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const deletedEntrada = await Entrada.findByIdAndDelete(id, { session });
    if (!deletedEntrada) {
      return res.status(404).json({ message: 'Entrada não encontrada' });
    }
    await Saida.findOneAndDelete({ entradaId: id }, { session });
    await session.commitTransaction();
    res.json({ message: 'Entrada e dízimo associado deletados com sucesso' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
