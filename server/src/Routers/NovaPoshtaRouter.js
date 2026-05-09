import express from 'express';
import { getCities, getWarehouses } from '../Controllers/NovaPoshtaController.js';

const router = express.Router();

router.get('/novaposhta/cities', getCities);
router.get('/novaposhta/warehouses', getWarehouses);

export default router;
