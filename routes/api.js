const express = require('express');
const router = express.Router();
const Entrada = require('../models/entradaModel');
const Saida = require('../models/saidaModel');

// --- ROTAS DE ENTRADAS ---

// GET all entradas
router.get('/entradas', async (req, res) => {
    try {
        const entradas = await Entrada.find().sort({ data: -1 });
        res.json(entradas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new entrada
router.post('/entradas', async (req, res) => {
    const entrada = new Entrada({
        fonte: req.body.fonte,
        valor: req.body.valor,
        data: req.body.data,
        status: req.body.status
    });

    try {
        const novaEntrada = await entrada.save();
        
        // Criar dízimo associado
        const dizimo = new Saida({
            descricao: `Dízimo - ${novaEntrada.fonte}`,
            categoria: 'Dízimo',
            valor: novaEntrada.valor * 0.10,
            data: novaEntrada.data,
            status: 'pago',
            entradaId: novaEntrada._id // Link para a entrada original
        });
        await dizimo.save();

        res.status(201).json(novaEntrada);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// PUT (update) an entrada
router.put('/entradas/:id', async (req, res) => {
    try {
        const entradaOriginal = await Entrada.findById(req.params.id);
        if (!entradaOriginal) return res.status(404).json({ message: 'Entrada não encontrada' });

        const updatedEntrada = await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Se o valor ou a data da entrada mudou, atualize o dízimo
        if (req.body.valor !== undefined || req.body.data !== undefined) {
             const novoValorDizimo = (req.body.valor !== undefined ? req.body.valor : updatedEntrada.valor) * 0.10;
             const novaDataDizimo = req.body.data !== undefined ? req.body.data : updatedEntrada.data;
            await Saida.findOneAndUpdate(
                { entradaId: updatedEntrada._id },
                { valor: novoValorDizimo, data: novaDataDizimo, descricao: `Dízimo - ${updatedEntrada.fonte}` },
                { new: true, sort: { createdAt: -1 } } // Garante que atualize o mais recente, se houver múltiplos por erro
            );
        }
        
        res.json(updatedEntrada);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an entrada
router.delete('/entradas/:id', async (req, res) => {
    try {
        const deletedEntrada = await Entrada.findByIdAndDelete(req.params.id);
        if (!deletedEntrada) return res.status(404).json({ message: 'Entrada não encontrada' });
        
        // Excluir dízimo associado
        await Saida.deleteMany({ entradaId: req.params.id });

        res.json({ message: 'Entrada e dízimo associado foram deletados' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE multiple entradas
router.delete('/entradas', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
        }
        await Saida.deleteMany({ entradaId: { $in: ids } });
        await Entrada.deleteMany({ _id: { $in: ids } });

        res.json({ message: `${ids.length} entradas e dízimos associados foram deletados.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// PUT (update) status of multiple entradas
router.put('/entradas/bulk-status', async (req, res) => {
    try {
        const { ids, status } = req.body;
        await Entrada.updateMany({ _id: { $in: ids } }, { $set: { status: status } });
        res.json({ message: `Status de ${ids.length} entradas atualizado para ${status}.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- ROTAS DE SAÍDAS ---

// GET all saidas
router.get('/saidas', async (req, res) => {
    try {
        const saidas = await Saida.find().sort({ data: -1 });
        res.json(saidas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new saida
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
        const novaSaida = await saida.save();
        res.status(201).json(novaSaida);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a saida
router.put('/saidas/:id', async (req, res) => {
    try {
        const updatedSaida = await Saida.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSaida) return res.status(404).json({ message: 'Saída não encontrada' });
        res.json(updatedSaida);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a saida
router.delete('/saidas/:id', async (req, res) => {
    try {
        const saida = await Saida.findById(req.params.id);
        if (!saida) return res.status(404).json({ message: 'Saída não encontrada' });
        
        // Impede a exclusão de dízimos automáticos
        if (saida.entradaId) {
            return res.status(403).json({ message: 'Dízimos automáticos não podem ser excluídos diretamente.' });
        }

        await Saida.findByIdAndDelete(req.params.id);

        res.json({ message: 'Saída deletada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE multiple saidas
router.delete('/saidas', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
        }
        // Garante que dízimos automáticos não sejam excluídos em lote
        await Saida.deleteMany({ _id: { $in: ids }, entradaId: null });

        res.json({ message: `Saídas selecionadas foram deletadas.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// PUT (update) status of multiple saidas
router.put('/saidas/bulk-status', async (req, res) => {
    try {
        const { ids, status } = req.body;
        await Saida.updateMany({ _id: { $in: ids } }, { $set: { status: status } });
        res.json({ message: `Status de ${ids.length} saídas atualizado para ${status}.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
