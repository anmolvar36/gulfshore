import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getIsSignedInServer() {
	try {
		const cookieStore = await cookies();
		const mockCookie = cookieStore.get("mock_signed_in");
		return mockCookie ? mockCookie.value !== "false" : false;
	} catch (e) {
		return false;
	}
}

async function getMockEmailServer() {
	try {
		const cookieStore = await cookies();
		const mockEmail = cookieStore.get("mock_user_email");
		return mockEmail && mockEmail.value !== "false" ? mockEmail.value : "user@gulfshore.com";
	} catch (e) {
		return "user@gulfshore.com";
	}
}

export function clerkMiddleware(callback?: any) {
	return async (req: any, event: any) => {
		const signedIn = await getIsSignedInServer();
		const email = await getMockEmailServer();
		const isAdmin = email === "admin@gulfshore.com";
		const mockAuth = async () => ({ 
			userId: signedIn ? (isAdmin ? "admin_dummy_123" : "user_dummy_123") : null 
		});
		if (callback && typeof callback === "function") {
			return await callback(mockAuth, req, event);
		}
		return NextResponse.next();
	};
}

export function createRouteMatcher(routes: string[]) {
	return (req: any) => {
		const pathname = req.nextUrl?.pathname || "";
		return routes.some(route => pathname.startsWith(route));
	};
}

export async function auth() {
	const signedIn = await getIsSignedInServer();
	const email = await getMockEmailServer();
	const isAdmin = email === "admin@gulfshore.com";
	return { 
		userId: signedIn ? (isAdmin ? "admin_dummy_123" : "user_dummy_123") : null 
	};
}

export async function currentUser() {
	const signedIn = await getIsSignedInServer();
	if (!signedIn) return null;
	
	const email = await getMockEmailServer();
	const isAdmin = email === "admin@gulfshore.com";

	return {
		id: isAdmin ? "admin_dummy_123" : "user_dummy_123",
		fullName: isAdmin ? "Admin User" : "Regular User",
		primaryEmailAddress: { emailAddress: email },
		publicMetadata: { role: isAdmin ? "admin" : "user" }
	};
}
