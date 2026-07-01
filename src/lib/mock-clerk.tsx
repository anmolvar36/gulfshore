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
			setSignedIn(getCookie("mock_signed_in") === "true");
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

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (email === "admin@gulfshore.com") {
			if (password === "admin") {
				setCookie("mock_signed_in", "true");
				setCookie("mock_user_email", email);
				if (typeof sessionStorage !== "undefined") {
					sessionStorage.setItem("just_signed_in", "true");
				}
				setShowModal(false);
				window.location.reload();
			} else {
				setError("Invalid password for admin. Use: admin");
			}
		} else {
			// Normal user login: require password to be at least 4 characters
			if (password.length >= 4) {
				setCookie("mock_signed_in", "true");
				setCookie("mock_user_email", email);
				setShowModal(false);
				window.location.reload();
			} else {
				setError("Password must be at least 4 characters long");
			}
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
	const [signedIn, setSignedIn] = React.useState(false);
	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
	}, []);
	return signedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
	const [signedIn, setSignedIn] = React.useState(false);
	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
	}, []);
	return !signedIn ? <>{children}</> : null;
}

export function UserButton() {
	const [email, setEmail] = React.useState("user@gulfshore.com");
	React.useEffect(() => {
		const mockEmail = getCookie("mock_user_email");
		if (mockEmail && mockEmail !== "false") {
			setEmail(mockEmail);
		}
	}, []);

	const initials = email === "admin@gulfshore.com" ? "AD" : email.substring(0, 2).toUpperCase();

	return (
		<div 
			onClick={() => {
				setCookie("mock_signed_in", "false");
				setCookie("mock_user_email", "false");
				window.location.href = "/";
			}}
			style={{
				width: "32px",
				height: "32px",
				borderRadius: "50%",
				backgroundColor: "#3b82f6",
				color: "white",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: "14px",
				fontWeight: "bold",
				cursor: "pointer"
			}}
			title="Click to sign out (mock)">
			{initials}
		</div>
	);
}

export function useUser() {
	const [signedIn, setSignedIn] = React.useState(false);
	const [email, setEmail] = React.useState("user@gulfshore.com");

	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		const mockEmail = getCookie("mock_user_email");
		if (mockEmail && mockEmail !== "false") {
			setEmail(mockEmail);
		}
	}, []);

	const isAdmin = email === "admin@gulfshore.com";

	return {
		isLoaded: true,
		isSignedIn: signedIn,
		user: signedIn ? {
			id: isAdmin ? "admin_dummy_123" : "user_dummy_123",
			fullName: isAdmin ? "Admin User" : "Regular User",
			primaryEmailAddress: { emailAddress: email },
			publicMetadata: { role: isAdmin ? "admin" : "user" }
		} : null
	};
}

export function useAuth() {
	const [signedIn, setSignedIn] = React.useState(false);
	const [email, setEmail] = React.useState("user@gulfshore.com");

	React.useEffect(() => {
		setSignedIn(getCookie("mock_signed_in") === "true");
		const mockEmail = getCookie("mock_user_email");
		if (mockEmail && mockEmail !== "false") {
			setEmail(mockEmail);
		}
	}, []);

	const isAdmin = email === "admin@gulfshore.com";

	return {
		isLoaded: true,
		isSignedIn: signedIn,
		userId: signedIn ? (isAdmin ? "admin_dummy_123" : "user_dummy_123") : null,
		getToken: async () => "dummy-token"
	};
}

export function SignInButton({ children }: { children: React.ReactNode }) {
	const handleSignIn = () => {
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("open-mock-signin"));
		}
	};
	return <span onClick={handleSignIn} style={{ cursor: "pointer" }}>{children}</span>;
}

export function SignOutButton({ children }: { children: React.ReactNode }) {
	const handleSignOut = () => {
		setCookie("mock_signed_in", "false");
		setCookie("mock_user_email", "false");
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
			create: async () => {},
			prepareEmailAddressVerification: async () => {},
			attemptEmailAddressVerification: async () => {},
		}
	};
}
