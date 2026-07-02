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
		return mockEmail && mockEmail.value !== "false" ? mockEmail.value : "admin@gulfshore.com";
	} catch (e) {
		return "admin@gulfshore.com";
	}
}

export function clerkMiddleware(callback?: any) {
	return async (req: any, event: any) => {
		const signedIn = await getIsSignedInServer();
		const mockAuth = async () => ({ 
			userId: signedIn ? "admin_dummy_123" : null 
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
	return { 
		userId: signedIn ? "admin_dummy_123" : null 
	};
}

export async function currentUser() {
	const signedIn = await getIsSignedInServer();
	if (!signedIn) return null;
	
	const email = await getMockEmailServer();

	return {
		id: "admin_dummy_123",
		fullName: "Admin User",
		primaryEmailAddress: { emailAddress: email },
		publicMetadata: { role: "admin" }
	};
}
