const router = require('express').Router();

const asyncWrapper = require('../../helpers/asyncWrapper');
const retailerController = require('../../controllers/retailer');

router.get('/', asyncWrapper(retailerController.ListRetailers));
router.post('/', asyncWrapper(retailerController.CreateRetailer));
router.get('/test', asyncWrapper(retailerController.test));
router.get('/sync', asyncWrapper(retailerController.SyncRetailers));

module.exports = router;
