import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function VerifyAdmin() {
	console.log("[VerifyAdmin] Hook executing...");
	const { userId } = await auth();
	const user = await currentUser();
	console.log("[VerifyAdmin] Auth state:", { 
		userId, 
		email: user?.primaryEmailAddress?.emailAddress, 
		role: user?.publicMetadata?.role 
	});

	// Check if authenticated and has admin metadata role
	const isAdmin = userId && user && user.publicMetadata?.role === "admin";
	console.log("[VerifyAdmin] isAdmin check:", isAdmin);

	if (!isAdmin) {
		console.log("[VerifyAdmin] Redirecting to /admin/sign-in");
		return redirect("/admin/sign-in");
	}

	console.log("[VerifyAdmin] Access granted!");
	return null;
}
