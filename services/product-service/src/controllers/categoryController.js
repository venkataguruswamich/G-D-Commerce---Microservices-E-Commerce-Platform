const categoryModel = require('../models/categoryModel');
const AppError = require('../utils/AppError');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.list();
    return res.status(200).json({ success: true, data: categories, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryModel.create(req.body);
    return res.status(201).json({ success: true, data: category, requestId: req.requestId });
  } catch (err) {
    if (err.code === '23505') return next(new AppError('CATEGORY_EXISTS', 'A category with this name or slug already exists', 409));
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const updated = await categoryModel.update(req.params.id, req.body);
    if (!updated) return next(new AppError('NOT_FOUND', 'Category not found', 404));
    return res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const deleted = await categoryModel.remove(req.params.id);
    if (!deleted) return next(new AppError('NOT_FOUND', 'Category not found', 404));
    return res.status(200).json({ success: true, data: { id: req.params.id }, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
