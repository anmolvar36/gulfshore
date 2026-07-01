import {
	clerkMiddleware,
	createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isSignUpRoute = createRouteMatcher(["/signup"]);

export default clerkMiddleware(async (auth, req) => {
	const origin = req.headers.get("origin") || "*";

	// CORS Preflight handling for API requests
	if (req.nextUrl.pathname.startsWith("/api")) {
		if (req.method === "OPTIONS") {
			return new NextResponse(null, {
				status: 200,
				headers: {
					"Access-Control-Allow-Origin": origin,
					"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
					"Access-Control-Allow-Credentials": "true",
				},
			});
		}
	}

	const { userId } = await auth();
	let response = NextResponse.next();
	
	if (isSignUpRoute(req) && userId) {
		response = NextResponse.redirect(
			new URL(`/`, "https://gulfshoregroup.com")
		);
	}

	// Add CORS headers to all API responses
	if (req.nextUrl.pathname.startsWith("/api")) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS"
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, x-requested-with"
		);
		response.headers.set("Access-Control-Allow-Credentials", "true");
	}

	return response;
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
