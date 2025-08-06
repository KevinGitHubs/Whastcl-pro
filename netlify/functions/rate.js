export async function handler(event) {
  const ip = event.headers['client-ip'];
  const key = `rate:${ip}`;
  const count = Number(await RateLimit.get(key) || 0);
  if (count >= 10) return { statusCode: 429 };
  await RateLimit.set(key, count + 1, { ttl: 60 });
  return { statusCode: 200 };
}
