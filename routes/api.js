const express = require('express');
const router = express.Router();

const entradaController = require('../controllers/entradaController');
const saidaController = require('../controllers/saidaController');
const { validarEntrada, validarSaida } = require('../middleware/validate');

// --- ROTAS EM LOTE (devem vir antes de /:id) ---

router.put('/:type/bulk-status', saidaController.atualizarStatusEmLote);
router.delete('/:type', saidaController.deletarEmLote);

// --- ROTAS DE ENTRADAS ---

router.get('/entradas', entradaController.listar);
router.post('/entradas', validarEntrada, entradaController.criar);
router.put('/entradas/:id', validarEntrada, entradaController.atualizar);
router.delete('/entradas/:id', entradaController.deletar);

// --- ROTAS DE SAÍDAS ---

router.get('/saidas', saidaController.listar);
router.post('/saidas', validarSaida, saidaController.criar);
router.put('/saidas/:id', validarSaida, saidaController.atualizar);
router.delete('/saidas/:id', saidaController.deletar);

module.exports = router;
