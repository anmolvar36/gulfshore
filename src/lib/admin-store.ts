import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/admin-credentials.json");

export function getAdminCredentials() {
	try {
		if (fs.existsSync(filePath)) {
			const data = fs.readFileSync(filePath, "utf8");
			return JSON.parse(data);
		}
	} catch (e) {
		console.error("Error reading admin credentials:", e);
	}
	return { email: "admin@gulfshore.com", password: "admin" };
}

export function saveAdminCredentials(creds: { email: string; password?: string }) {
	try {
		const current = getAdminCredentials();
		const updated = {
			email: creds.email,
			password: creds.password !== undefined ? creds.password : current.password
		};
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
		return true;
	} catch (e) {
		console.error("Error saving admin credentials:", e);
		return false;
	}
}
