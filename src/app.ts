import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import apicache from 'apicache';
import { check, param, query, validationResult } from 'express-validator';
import { logNotCachedRequests, validateQueryParams } from './utils';

const cache = apicache.middleware;
const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.FINGRID_API_KEY;

app.use(express.json());

const proxy = createProxyMiddleware({
  target: 'https://api.fingrid.fi',
  changeOrigin: true,
  onProxyReq: (proxyReq) => {
    if (!API_KEY) throw new Error('FINGRID_API_KEY not set');
    proxyReq.setHeader('x-api-key', API_KEY);
  },
});

app.use('/', validateQueryParams, cache('1 hours'), logNotCachedRequests, proxy);

app.listen(PORT, () => console.log(`Server Listening to port ${PORT}`));

process.on('uncaughtException', (error) => {
  console.log(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.log(reason);
});

export default app;
