import { Request, Response, NextFunction } from 'express';
import { param, query, validationResult } from 'express-validator';
import { IsDateOptions } from 'express-validator/src/options';

const validateFingridRequest = async (req: Request, res: Response, next: NextFunction) => {
  await query('start_time').isISO8601().run(req);
  await query('end_time').isISO8601().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

const validateVattenfallRequest = async (req: Request, res: Response, next: NextFunction) => {
  const dateOptions: IsDateOptions = { strictMode: true, format: 'YYYY-MM-DD', delimiters: ['-'] };
  await param('start_date').isDate(dateOptions).run(req);
  await param('end_date').isDate(dateOptions).run(req);
  await query('lang').isIn(['fi', 'sv']).run(req);
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

class ErrorWithStatus extends Error {
  status: number;

  constructor(status: number, name: string, message: string) {
    super();
    this.status = status;
    this.name = name;
    this.message = message;
  }
}

const errorHandler = (
  errors: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (errors instanceof Array) {
    res.status(422).json({ errors });
  } else if (errors instanceof ErrorWithStatus) {
    const { status, name, message } = errors;
    res.status(status).json({ errors: [{ name, message }] });
  }
};

interface ResponseItem {
  name: string;
  message: string;
}

/**
 * @description Returns success response object
 * @param results {array} Response item array
 */
const success = (results: Array<unknown | ResponseItem>) => ({ results });

export {
  validateFingridRequest,
  validateVattenfallRequest,
  logNotCachedRequests,
  success,
  ErrorWithStatus,
  errorHandler,
};
