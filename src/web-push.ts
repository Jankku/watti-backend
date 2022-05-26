import { NextFunction, Request, Response } from 'express';
import webpush, { PushSubscription } from 'web-push';
import { Subscription } from './db';
import { ErrorWithStatus } from './utils';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const WEBSITE_URL = process.env.WEBSITE_URL;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.log(`Use these keys: ${webpush.generateVAPIDKeys()}`);
  throw new Error('Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY variables in .env file.');
}

if (!WEBSITE_URL) throw new Error('WEBSITE_URL not set');

const setupWebPush = () => {
  webpush.setVapidDetails(WEBSITE_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
};

const createPushSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const sub = req.body.data.subscription as PushSubscription;

  try {
    const exists = await Subscription.findOne({ endpoint: sub.endpoint }).lean();
    if (exists) {
      res
        .status(200)
        .send({ name: 'subscription_success', message: 'Push subscription already exists' });
      return;
    }

    await Subscription.create(sub);

    res.status(201).send({ name: 'subscription_success', message: 'Push subscription created' });
  } catch (error) {
    next(new ErrorWithStatus(422, 'subscription_error', 'Failed to create push subscription'));
  }
};

const removePushSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const sub = req.body.data.subscription as PushSubscription;

  try {
    await Subscription.remove({ endpoint: sub.endpoint });
    res.status(200).send({ name: 'subscription_success', message: 'Push subscription removed' });
  } catch (error) {
    next(new ErrorWithStatus(422, 'subscription_error', 'Failed to remove push subscription'));
  }
};

const sendPushNotification = async (req: Request, res: Response, next: NextFunction) => {
  const subEndpoint = req.body.endpoint;

  try {
    const subscription: PushSubscription = await Subscription.findOne({
      endpoint: subEndpoint,
    }).lean();

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: 'Test', text: '1234' })
    );
    res.sendStatus(result.statusCode);
  } catch (error) {
    next(new ErrorWithStatus(422, 'notification_error', 'Failed to send push notification'));
  }
};

const getVapidPublicKey = (req: Request, res: Response) => {
  res.status(200).send({
    vapidPublicKey: VAPID_PUBLIC_KEY,
  });
};

export {
  setupWebPush,
  createPushSubscription,
  removePushSubscription,
  sendPushNotification,
  getVapidPublicKey,
};
