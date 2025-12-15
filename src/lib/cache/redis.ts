import { createClient } from "redis";

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient>;
};

export const redisClient =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisClient;

if (!redisClient.isOpen) {
  redisClient.connect().catch(console.error);
}
