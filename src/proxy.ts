import { createProxyMiddleware } from 'http-proxy-middleware';

const API_KEY = process.env.FINGRID_API_KEY;
if (!API_KEY) throw new Error('FINGRID_API_KEY not set');

const setupFingridProxy = createProxyMiddleware({
  target: 'https://api.fingrid.fi',
  changeOrigin: true,
  pathRewrite: {
    '^/fingrid': '/',
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('x-api-key', API_KEY);
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
