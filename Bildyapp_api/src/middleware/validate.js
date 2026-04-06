function validate(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.params) req.params = validatedData.params;

      next();
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Error de validación",
        details: error.issues?.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
  };
}

export default validate;