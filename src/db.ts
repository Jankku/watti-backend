import mongoose from 'mongoose';
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('Set MONGO_URI variable in .env file');

try {
  await mongoose.connect(MONGO_URI);
} catch (_) {
  console.error('Connecting to MongoDB failed.');
}

mongoose.connection.on('error', (err) => {
  console.error(err);
});

type DbPushSubscription = {
  endpoint: string;
  keys: { auth: string; p256dh: string };
  created: Date;
};

const SubscriptionSchema = new Schema<DbPushSubscription>({
  endpoint: { type: String, index: true, required: true },
  keys: {
    auth: { type: String, required: true },
    p256dh: { type: String, required: true },
  },
  created: { type: Date, default: Date.now, required: true },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export { Subscription };
