import { createProxyMiddleware } from 'http-proxy-middleware';

const FINGRID_API_KEY = process.env.FINGRID_API_KEY;
if (!FINGRID_API_KEY) throw new Error('Set FINGRID_API_KEY variable in .env file');

const setupFingridProxy = createProxyMiddleware({
  target: 'https://api.fingrid.fi',
  changeOrigin: true,
  pathRewrite: {
    '^/fingrid': '/',
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('x-api-key', FINGRID_API_KEY);
  },
});

const setupVattenfallProxy = createProxyMiddleware({
  target: 'https://www.vattenfall.fi/api/price/spot/',
  changeOrigin: true,
  pathRewrite: {
    '^/vattenfall': '/',
  },
});

export { setupFingridProxy, setupVattenfallProxy };
