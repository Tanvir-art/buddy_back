import { ZodError } from 'zod';

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      //   Validate request body
      if (req.body && Object.keys(req.body).length > 0) {
        const validatedBody = await schema.parseAsync(req.body);
        req.body = validatedBody;
      }
      
      //   Validate query params  
      if (req.query && Object.keys(req.query).length > 0) {
        try {
          const validatedQuery = await schema.parseAsync(req.query);
          
          req.validatedQuery = validatedQuery;
        } catch (queryError) {
          // If query validation fails, still continue but log
          console.warn('Query validation warning:', queryError.message);
        }
      }
      
      //   Validate params
      if (req.params && Object.keys(req.params).length > 0) {
        try {
          const validatedParams = await schema.parseAsync(req.params);
          req.validatedParams = validatedParams;
        } catch (paramsError) {
          console.warn('Params validation warning:', paramsError.message);
        }
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};

export default validate;