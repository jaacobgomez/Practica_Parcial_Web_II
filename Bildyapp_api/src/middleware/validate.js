function validate(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Error de validación",
        details: error.errors?.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
  };
}

export default validate;