import Redis from "ioredis";

let redis: Redis | null = null;

try {
	if (process.env.ENV !== "DEV") {
		redis = new Redis({
			host: "127.0.0.1",
			port: 6379,
			password: "t730XEKRdfAY",
			retryStrategy(times) {
				// Don't spam retries
				if (times > 3) return null;
				return 1000;
			},
			maxRetriesPerRequest: 2,
			connectTimeout: 200,
		});
	} else {
		{
			redis = new Redis({
				host: "127.0.0.1",
				port: 6379,
				retryStrategy(times) {
					// Don't spam retries
					if (times > 3) return null;
					return 1000;
				},
				maxRetriesPerRequest: 2,
				connectTimeout: 200,
			});
		}
	}
} catch (err) {
	redis = null;
}

if (redis) {
	redis.on("error", () => {
		// Avoid unhandled crash
		redis = null;
	});
}

export function isRedisUp() {
	return redis !== null;
}

export default redis;
