import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apicache from 'apicache';
import { setupFingridProxy, setupVattenfallProxy } from './proxy';
import {
  errorHandler,
  getFingridCacheDuration,
  getVattenfallCacheDuration,
  logNotCachedRequests,
  onlyStatus200,
  validateFingridRequest,
  validateVattenfallRequest,
} from './utils';
import {
  createPushSubscription,
  removePushSubscription,
  getVapidPublicKey,
  sendPushNotification,
  setupWebPush,
} from './web-push';

const PORT = process.env.PORT || 5000;
const app = express();
const cache = apicache.middleware;

app.use(cors());
app.use(express.json());

/**
 * Proxies
 */
app.use(
  '/fingrid',
  validateFingridRequest,
  cache(getFingridCacheDuration(), onlyStatus200),
  logNotCachedRequests,
  setupFingridProxy
);

app.use(
  '/vattenfall/:start_date/:end_date',
  validateVattenfallRequest,
  cache(getVattenfallCacheDuration(), onlyStatus200),
  logNotCachedRequests,
  setupVattenfallProxy
);

/**
 * Push notifications
 */
setupWebPush();
app.post('/api/subscription/create', createPushSubscription);
app.post('/api/subscription/remove', removePushSubscription);
app.get('/api/subscription/notify', sendPushNotification);
app.get('/api/subscription/key', getVapidPublicKey);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server Listening to port ${PORT}`));

process.on('uncaughtException', (error) => {
  console.log(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.log(reason);
});

export default app;
