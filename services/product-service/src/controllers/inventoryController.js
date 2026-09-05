const inventoryModel = require('../models/inventoryModel');
const productModel = require('../models/productModel');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');

async function listInventory(req, res, next) {
  try {
    const result = await inventoryModel.list({ page: req.query.page, limit: req.query.limit });
    return res.status(200).json({ success: true, data: result, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getInventory(req, res, next) {
  try {
    const { id } = req.params;
    const inventory = await inventoryModel.getByProductId(id);
    if (!inventory) return next(new AppError('NOT_FOUND', 'Inventory record not found', 404));
    return res.status(200).json({ success: true, data: inventory, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function updateInventory(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) return next(new AppError('NOT_FOUND', 'Product not found', 404));

    const inventory = await inventoryModel.upsert(id, req.body);
    await cache.invalidate(cache.productCacheKey(id));
    return res.status(200).json({ success: true, data: inventory, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listInventory, getInventory, updateInventory };
