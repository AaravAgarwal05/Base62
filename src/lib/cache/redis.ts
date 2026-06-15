import { createClient, type RedisClientType } from "redis";

const url = process.env.REDIS_URL;

/** Stub returned when Redis is unavailable (build, dev without Redis). */
const noop = {
  get: async () => null,
  set: async () => null,
  del: async () => 0,
  expire: async () => false,
  incr: async () => 0,
  lPush: async () => 0,
  lRange: async () => [],
  hSet: async () => 0,
  hGetAll: async () => ({}),
  on: () => {},
  quit: async () => {},
  isOpen: false,
} as unknown as RedisClientType;

let realClient: RedisClientType | null = null;
let connected = false;
let connecting: Promise<void> | null = null;

async function ensureConnected(): Promise<void> {
  if (connected || connecting || !url) return;
  connecting = (async () => {
    try {
      realClient = createClient({ url }) as RedisClientType;
      await realClient.connect();
      connected = true;
    } catch (e) {
      console.warn("[Redis] Not available, running without cache:", e);
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

function delegate(prop: string | symbol, ...args: unknown[]): unknown {
  // If connected, forward to real client
  if (connected && realClient) {
    const val = (realClient as any)[prop];
    return typeof val === "function" ? val.apply(realClient, args) : val;
  }
  // Otherwise use noop
  const stub = (noop as any)[prop];
  return typeof stub === "function" ? stub(...args) : stub;
}

export const redisClient = new Proxy<RedisClientType>({} as RedisClientType, {
  get(_, prop: string | symbol) {
    if (prop === "then") return undefined; // not thenable
    return (...args: unknown[]) => {
      return ensureConnected().then(() => delegate(prop, ...args));
    };
  },
});

export async function getRedis(): Promise<RedisClientType> {
  await ensureConnected();
  return connected && realClient ? realClient : noop;
}
