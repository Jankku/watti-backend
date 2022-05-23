import { createProxyMiddleware } from 'http-proxy-middleware';

const API_KEY = process.env.FINGRID_API_KEY;
if (!API_KEY) throw new Error('FINGRID_API_KEY not set');

const setupProxy = createProxyMiddleware({
  target: 'https://api.fingrid.fi',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '/',
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('x-api-key', API_KEY);
  },
});

export { setupProxy };
