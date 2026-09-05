const productModel = require('../models/productModel');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

async function listProducts(req, res, next) {
  try {
    const result = await productModel.search(req.query);
    return res.status(200).json({ success: true, data: result, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await cache.getOrSet(cache.productCacheKey(id), null, () => productModel.findById(id));
    if (!product) return next(new AppError('NOT_FOUND', 'Product not found', 404));
    return res.status(200).json({ success: true, data: product, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productModel.create(req.body);
    logger.info('Product created', { requestId: req.requestId, productId: product.id });
    return res.status(201).json({ success: true, data: product, requestId: req.requestId });
  } catch (err) {
    if (err.code === '23505') return next(new AppError('SKU_IN_USE', 'A product with this SKU already exists', 409));
    return next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await productModel.update(id, req.body);
    if (!updated) return next(new AppError('NOT_FOUND', 'Product not found', 404));
    await cache.invalidate(cache.productCacheKey(id));
    logger.info('Product updated', { requestId: req.requestId, productId: id });
    return res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await productModel.remove(id);
    if (!deleted) return next(new AppError('NOT_FOUND', 'Product not found', 404));
    await cache.invalidate(cache.productCacheKey(id));
    logger.info('Product deleted', { requestId: req.requestId, productId: id });
    return res.status(200).json({ success: true, data: { id }, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
