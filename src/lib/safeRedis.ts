// lib/safeRedis.ts
import redis from "@/lib/redis";

export async function redisGet(key: string) {
	try {
		const value = await redis.get(key);
		return value ? JSON.parse(value) : null;
	} catch (err) {
		console.error("Redis GET failed:", err);
		return null; // fallback
	}
}

export async function redisSet(
	key: string,
	value: any,
	ttlSeconds = 3600
) {
	try {
		await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
	} catch (err) {
		console.error("Redis SET failed:", err);
		// Do nothing – fallback mode
	}
}
