"use client";
import React from "react";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
	const [signedIn, setSignedIn] = React.useState(false);
	const [showModal, setShowModal] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState("");

	React.useEffect(() => {
		const check = () => {
			const isSignedIn = getCookie("mock_signed_in") === "true";
			setSignedIn(isSignedIn);
			if (isSignedIn) {
				const mockUserId = getCookie("mock_user_id");
				const mockEmail = getCookie("mock_user_email");
				if (!mockUserId || mockUserId === "false") {
					const isAdmin = mockEmail && mockEmail !== "false" && mockEmail.toLowerCase().includes("admin@gulfshore.com");
					setCookie("mock_user_id", isAdmin ? "admin_dummy_123" : "user_dummy_123");
				}
			}
		};
		check();
		const interval = setInterval(check, 1000);

		const handleOpenSignIn = () => {
			setShowModal(true);
			setError("");
			setEmail("");
			setPassword("");
		};

		if (typeof window !== "undefined") {
			window.addEventListener("open-mock-signin", handleOpenSignIn);
		}

		return () => {
			clearInterval(interval);
			if (typeof window !== "undefined") {
				window.removeEventListener("open-mock-signin", handleOpenSignIn);
			}
		};
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		try {
			const res = await fetch("/api/admin/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "login", email, password })
			});
			const data = await res.json();
			if (data.success) {
				setCookie("mock_signed_in", "true");
				setCookie("mock_user_email", data.email);
				setCookie("mock_user_id", "admin_dummy_123");
				if (typeof sessionStorage !== "undefined") {
					sessionStorage.setItem("just_signed_in", "true");
				}
				setShowModal(false);
				window.location.reload();
			} else {
				setError(data.error || "Invalid credentials");
			}
		} catch (err) {
			setError("Failed to connect to authentication service.");
		}
	};

	return (
		<>
			{children}
			{showModal && (
				<div style={{
					position: "fixed",
					inset: 0,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					backdropFilter: "blur(4px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: "sans-serif",
					zIndex: 999999
				}}>
					<div style={{
						backgroundColor: "white",
						padding: "32px",
						borderRadius: "16px",
						boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
						maxWidth: "400px",
						width: "90%",
						color: "#1f2937"
					}}>
						<div style={{ textAlign: "center", marginBottom: "24px" }}>
							<h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "bold", color: "#111827" }}>Gulfshore Group</h2>
							<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Sign in to your account</p>
						</div>

						<form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
							<div>
								<label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Email Address</label>
								<input 
									type="email" 
									required 
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com or admin@gulfshore.com"
									style={{
										width: "100%",
										padding: "10px 14px",
										borderRadius: "8px",
										border: "1px solid #d1d5db",
										fontSize: "15px",
										boxSizing: "border-box"
									}}
								/>
							</div>

							<div>
								<label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Password</label>
								<input 
									type="password" 
									required 
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									style={{
										width: "100%",
										padding: "10px 14px",
										borderRadius: "8px",
										border: "1px solid #d1d5db",
										fontSize: "15px",
										boxSizing: "border-box"
									}}
								/>
							</div>

							{error && (
								<p style={{ margin: 0, color: "#ef4444", fontSize: "13px", fontWeight: 500 }}>{error}</p>
							)}

							<button 
								type="submit"
								style={{
									backgroundColor: "#3b82f6",
									color: "white",
									border: "none",
									padding: "12px",
									borderRadius: "8px",
									fontSize: "16px",
									fontWeight: "bold",
									cursor: "pointer",
									marginTop: "8px",
									transition: "background-color 0.2s"
								}}>
								Sign In
							</button>

							<button 
								type="button"
								onClick={() => setShowModal(false)}
								style={{
									backgroundColor: "transparent",
									color: "#4b5563",
									border: "none",
									padding: "8px",
									fontSize: "14px",
									cursor: "pointer",
									textDecoration: "underline"
								}}>
								Cancel
							</button>
						</form>
						
						<div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "12px", color: "#4b5563", textAlign: "center" }}>
							<strong>Credentials:</strong><br />
							Admin: <code>admin@gulfshore.com</code> / <code>admin</code><br />
							User: Use any email and password (min 4 chars)!
						</div>
					</div>
				</div>
			)}
		</>
	);
}

const getCookie = (name: string) => {
	if (typeof document === "undefined") return "false";
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift() || "false";
	return "false";
};

const setCookie = (name: string, val: string) => {
	if (typeof document !== "undefined") {
		document.cookie = `${name}=${val}; path=/; max-age=31536000`;
	}
};

export function SignedIn({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	const [signedIn, setSignedIn] = React.useState(false);
	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		setMounted(true);
	}, []);
	if (!mounted) return null;
	return signedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = React.useState(false);
	const [signedIn, setSignedIn] = React.useState(false);
	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		setMounted(true);
	}, []);
	if (!mounted) return null;
	return !signedIn ? <>{children}</> : null;
}

export function UserButton() {
	const [email, setEmail] = React.useState("user@gulfshore.com");
	const [isOpen, setIsOpen] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const mockEmail = getCookie("mock_user_email");
		if (mockEmail && mockEmail !== "false") {
			setEmail(mockEmail);
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const initials = email.toLowerCase().includes("admin@gulfshore.com") ? "AD" : email.substring(0, 2).toUpperCase();

	const handleSignOut = () => {
		setCookie("mock_signed_in", "false");
		setCookie("mock_user_email", "false");
		setCookie("mock_user_id", "false");
		window.location.href = "/";
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button 
				onClick={() => setIsOpen(!isOpen)}
				className="w-9 h-9 rounded-full bg-[#d90429] hover:bg-[#bf0022] text-white flex items-center justify-center text-sm font-bold shadow-xs transition-all focus:outline-hidden cursor-pointer"
			>
				{initials}
			</button>

			{isOpen && (
				<div 
					className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-left"
					style={{ top: "100%" }}
				>
					<div className="px-4 py-2 border-b border-gray-100">
						<p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Logged in as</p>
						<p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{email}</p>
					</div>
					<div className="py-1">
						<a 
							href="/favorites"
							className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Saved Properties
						</a>
						<a 
							href="/user/saved-searches"
							className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Saved Searches
						</a>
					</div>
					<div className="border-t border-gray-100 pt-1">
						<button 
							onClick={handleSignOut}
							className="w-full text-left flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
						>
							Sign Out
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export function useUser() {
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [signedIn, setSignedIn] = React.useState(false);
	const [email, setEmail] = React.useState("user@gulfshore.com");
	const [userId, setUserId] = React.useState("");

	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		const mockEmail = getCookie("mock_user_email");
		const mockUserId = getCookie("mock_user_id");
		if (mockEmail && mockEmail !== "false") {
			setEmail(mockEmail);
		}
		if (mockUserId && mockUserId !== "false") {
			setUserId(mockUserId);
		}
		setIsLoaded(true);
	}, []);

	const isAdmin = signedIn && email.toLowerCase().includes("admin@gulfshore.com");

	return {
		isLoaded,
		isSignedIn: signedIn,
		user: signedIn ? {
			id: userId || (isAdmin ? "admin_dummy_123" : "user_dummy_123"),
			fullName: isAdmin ? "Admin User" : "Regular User",
			primaryEmailAddress: { emailAddress: email },
			publicMetadata: { role: isAdmin ? "admin" : "user" }
		} : null
	};
}

export function useAuth() {
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [signedIn, setSignedIn] = React.useState(false);
	const [userId, setUserId] = React.useState("");

	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		const mockUserId = getCookie("mock_user_id");
		if (mockUserId && mockUserId !== "false") {
			setUserId(mockUserId);
		}
		setIsLoaded(true);
	}, []);

	const mockEmail = getCookie("mock_user_email");
	const isAdmin = signedIn && mockEmail.toLowerCase().includes("admin@gulfshore.com");

	return {
		isLoaded,
		isSignedIn: signedIn,
		userId: signedIn ? (userId || (isAdmin ? "admin_dummy_123" : "user_dummy_123")) : null,
		getToken: async () => "dummy-token"
	};
}

export function SignInButton({ children }: { children: React.ReactNode }) {
	const handleSignIn = () => {
		if (typeof window !== "undefined") {
			window.location.href = "/signup?mode=signin";
		}
	};
	return <span onClick={handleSignIn} style={{ cursor: "pointer" }}>{children}</span>;
}

export function SignOutButton({ children }: { children: React.ReactNode }) {
	const handleSignOut = () => {
		setCookie("mock_signed_in", "false");
		setCookie("mock_user_email", "false");
		setCookie("mock_user_id", "false");
		window.location.href = "/";
	};
	return <span onClick={handleSignOut} style={{ cursor: "pointer" }}>{children}</span>;
}

export function SignUpButton({ children }: { children: React.ReactNode }) {
	const handleSignUp = () => {
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("open-mock-signin"));
		}
	};
	return <span onClick={handleSignUp} style={{ cursor: "pointer" }}>{children}</span>;
}

export function GoogleOneTap() {
	return null;
}

export function SignIn() {
	return (
		<div style={{ padding: "20px", textAlign: "center" }}>
			<h3>Sign In (Mocked)</h3>
			<button 
				onClick={() => {
					if (typeof window !== "undefined") {
						window.dispatchEvent(new Event("open-mock-signin"));
					}
				}}
				style={{ padding: "8px 16px", cursor: "pointer" }}
			>
				Open Sign In Form
			</button>
		</div>
	);
}

export function AuthenticateWithRedirectCallback() {
	return null;
}

export function useSignUp() {
	return {
		isLoaded: true,
		signUp: {
			create: async (params: any) => {
				console.log("Mock signup create called:", params);
				return { status: "missing_requirements" };
			},
			prepareEmailAddressVerification: async (params: any) => {
				console.log("Mock prepare email verification:", params);
				if (typeof window !== "undefined") {
					alert("Gulfshore Mock Clerk Mode:\nYour verification code is: 123456");
				}
				return { status: "missing_requirements" };
			},
			attemptEmailAddressVerification: async (params: { code: string }) => {
				console.log("Mock attempt verification code:", params.code);
				if (params.code === "123456" || params.code.length === 6) {
					setCookie("mock_signed_in", "true");
					return { status: "complete", createdSessionId: "mock_session_id" };
				}
				return { status: "missing_requirements", missingFields: ["code"] };
			},
		}
	};
}
