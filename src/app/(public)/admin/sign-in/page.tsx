"use client";
import React, { useState } from "react";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Cookie helper
		const setCookie = (name: string, val: string) => {
			document.cookie = `${name}=${val}; path=/; max-age=31536000`;
		};

		if (email === "admin@gulfshore.com" && password === "admin") {
			setCookie("mock_signed_in", "true");
			setCookie("mock_user_email", "admin@gulfshore.com");
			if (typeof sessionStorage !== "undefined") {
				sessionStorage.setItem("just_signed_in", "true");
			}
			window.location.href = "/admin/dashboard";
		} else {
			setError("Invalid email or password. Use: admin@gulfshore.com / admin");
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
						Gulfshore Group Admin
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Sign in to manage your platform
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleLogin}>
					<div className="space-y-4 rounded-md">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Email Address
							</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-[#B89A6A] focus:outline-hidden focus:ring-1 focus:ring-[#B89A6A] sm:text-sm"
								placeholder="admin@gulfshore.com"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">
								Password
							</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-[#B89A6A] focus:outline-hidden focus:ring-1 focus:ring-[#B89A6A] sm:text-sm"
								placeholder="••••••••"
							/>
						</div>
					</div>

					{error && (
						<div className="text-sm font-medium text-red-600">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative flex w-full justify-center rounded-lg bg-[#B89A6A] px-4 py-2 text-sm font-bold text-white hover:bg-[#a6895b] focus:outline-hidden focus:ring-2 focus:ring-[#B89A6A] focus:ring-offset-2 disabled:opacity-50 transition-colors"
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>
					</div>
				</form>

				<div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 text-center">
					<strong>Admin Credentials:</strong><br />
					Email: <code className="bg-gray-200 px-1 py-0.5 rounded">admin@gulfshore.com</code><br />
					Password: <code className="bg-gray-200 px-1 py-0.5 rounded">admin</code>
				</div>
			</div>
		</div>
	);
}
