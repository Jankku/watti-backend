import { Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';

const validateQueryParams = async (req: Request, res: Response, next: NextFunction) => {
  await query('start_time').isISO8601().run(req);
  await query('end_time').isISO8601().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

const logNotCachedRequests = (req: Request, res: Response, next: NextFunction) => {
  console.log(`NOT CACHED: ${req.url}`);
  next();
};

export { validateQueryParams, logNotCachedRequests };
