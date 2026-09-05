function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details.map((d) => d.message).join('; '),
        },
        requestId: req.requestId,
      });
    }
    req[source] = value;
    return next();
  };
}

module.exports = validate;
