"use client";

import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff, MapPin, Map, Search } from "lucide-react";
import { GoogleOneTap, useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ClerkAPIError, OAuthStrategy } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import axios from "axios";

export default function SignUpForm() {
	const query = useSearchParams();
	const redirectUrl = query.get("redirect_url") || "/";
	const { isLoaded, signUp, setActive } = useSignUp();
	const [showPassword, setShowPassword] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [errors, setErrors] = React.useState<ClerkAPIError[]>();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		agreeToTerms: true,
	});
	const [code, setCode] = React.useState("");
	const [countryCode, setCountryCode] = useState("+1");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isPhoneValid, setIsPhoneValid] = useState(false);
	const router = useRouter();
	const handleInputChange = (e: any) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const countryCodes = [
		{ code: "+1", country: "US/CA", flag: "🇺🇸" },
		{ code: "+44", country: "UK", flag: "🇬🇧" },
		{ code: "+971", country: "UAE", flag: "🇦🇪" },
		{ code: "+33", country: "France", flag: "🇫🇷" },
		{ code: "+49", country: "Germany", flag: "🇩🇪" },
		{ code: "+34", country: "Spain", flag: "🇪🇸" },
		{ code: "+39", country: "Italy", flag: "🇮🇹" },
		{ code: "+91", country: "India", flag: "🇮🇳" },
		{ code: "+86", country: "China", flag: "🇨🇳" },
		{ code: "+81", country: "Japan", flag: "🇯🇵" },
		{ code: "+61", country: "Australia", flag: "🇦🇺" },
	];

	const formatPhoneNumber = (value: any, country: any) => {
		const phoneNumber = value.replace(/[^\d]/g, "");
		if (country === "+1") {
			if (phoneNumber.length < 4) return phoneNumber;
			if (phoneNumber.length < 7)
				return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
			return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
				3,
				6
			)}-${phoneNumber.slice(6, 10)}`;
		} else {
			return phoneNumber.replace(/(\d{3})(?=\d)/g, "$1 ");
		}
	};

	const validatePhoneNumber = (phone: any, country: any) => {
		if (country === "+1") {
			return /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
		} else {
			const digits = phone.replace(/\D/g, "");
			return digits.length >= 7 && digits.length <= 15;
		}
	};

	const handlePhoneChange = (e: any) => {
		const formatted = formatPhoneNumber(e.target.value, countryCode);
		setPhoneNumber(formatted);
		setIsPhoneValid(validatePhoneNumber(formatted, countryCode));
	};

	const handleCountryChange = (e: any) => {
		const newCountry = e;
		setCountryCode(newCountry);
		if (phoneNumber) {
			const formatted = formatPhoneNumber(
				phoneNumber.replace(/\D/g, ""),
				newCountry
			);
			setPhoneNumber(formatted);
			setIsPhoneValid(validatePhoneNumber(formatted, newCountry));
		}
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (formData.password.length < 8) {
			setError("Password must be at least 8 characters long.");
			setIsLoading(false);
			return;
		}

		if (!isPhoneValid) {
			setError("Please enter a valid phone number.");
			setIsLoading(false);
			return;
		}
		if (!formData.agreeToTerms) {
			setError("You must agree to the terms and conditions.");
			setIsLoading(false);
			return;
		}

		if (!isLoaded) return;

		try {
			try {
				await axios.post("/api/v2/user/signup-lead", formData);
			} catch (error) {}
			await signUp?.create({
				emailAddress: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName,
			});
			await signUp?.prepareEmailAddressVerification({
				strategy: "email_code",
			});
			setVerifying(true);
			setIsLoading(false);
		} catch (err: any) {
			//	console.error("Sign up error:", err);
			if (isClerkAPIResponseError(err)) {
				setErrors(err.errors);
			} else {
				setError(err.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Handle the submission of the verification form
	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isLoaded) return;
		setIsLoading(true);
		setError("");
		try {
			// Use the code the user provided to attempt verification
			const completeSignUp =
				await signUp?.attemptEmailAddressVerification({
					code,
				});

			// If verification was completed, set the session to active
			// and redirect the user
			if (completeSignUp?.status === "complete") {
				await setActive({ session: completeSignUp.createdSessionId });

				router.push(redirectUrl);
			} else {
				// If the status is not complete, check why. User may need to
				// complete further steps.
				console.error(JSON.stringify(completeSignUp, null, 2));
			}
		} catch (err: any) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.log("Error:", err);
			if (isClerkAPIResponseError(err)) {
				setErrors(err.errors);
			} else {
				setError(err || "An error occurred during verification.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (verifying) {
		return (
			<div className="min-h-screen bg-gray-50 flex justify-center">
				<div className="w-full max-w-md p-6 h-min mt-20 bg-white rounded-lg shadow-md">
					<h1 className="my-4 font-bold text-2xl">
						Verify your email
					</h1>
					<form onSubmit={handleVerify}>
						<Label className="py-2" id="code">
							Enter your verification code
						</Label>
						<Input
							className="mb-6 mt-2"
							value={code}
							id="code"
							name="code"
							placeholder="Verification Code"
							onChange={(e) => setCode(e.target.value)}
						/>
						{errors ? (
							<ul className="text-red-500 text-sm mb-4">
								{errors.map((el, index) => (
									<li key={index}>{el.longMessage}</li>
								))}
							</ul>
						) : (
							error && (
								<p className="text-red-500 text-sm mb-4">{error}</p>
							)
						)}
						<Button
							disabled={isLoading}
							className="w-full"
							type="submit">
							{isLoading ? "Verifying..." : "Verify Email"}
						</Button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 ">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 text-[#d90429]">
					<Home size={128} />
				</div>
				<div className="absolute bottom-20 right-20 w-24 h-24 text-[#d90429]">
					<MapPin size={96} />
				</div>
				<div className="absolute top-1/2 left-10 w-16 h-16 text-[#d90429]">
					<Map size={64} />
				</div>
				<div className="absolute top-40 right-40 w-20 h-20 text-[#d90429] ">
					<Search size={80} />
				</div>
			</div>
			<div className="flex items-center relative justify-center z-10 pt-10 p-4">
				<div className="w-full max-w-md">
					<Card className="shadow-lg py-4 px-3">
						<CardHeader className="pb-4 mt-3">
							<CardTitle>Create Account</CardTitle>
							<CardDescription>
								Join and find your dream Florida home
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="firstName">First Name</Label>
									<Input
										name="firstName"
										placeholder="First Name"
										value={formData.firstName}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div>
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										name="lastName"
										placeholder="Last Name"
										value={formData.lastName}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="example@example.com"
									required
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone</Label>
								<div className="flex gap-2 max-h-10">
									<Select
										value={countryCode}
										onValueChange={(e) => handleCountryChange(e)}>
										<SelectTrigger>
											<SelectValue placeholder="Country Code" />
										</SelectTrigger>
										<SelectContent className="border max-h-50  rounded px-2">
											{countryCodes.map((c) => (
												<SelectItem key={c.code} value={c.code}>
													{c.flag} {c.code}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										type="tel"
										value={phoneNumber}
										onChange={handlePhoneChange}
										placeholder="Phone number"
									/>
								</div>
								{phoneNumber && !isPhoneValid && (
									<p className="text-red-500 text-sm">
										Invalid phone number
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										placeholder="password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-2 top-2">
										{showPassword ? (
											<Eye size={16} />
										) : (
											<EyeOff size={16} />
										)}
									</button>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									name="agreeToTerms"
									checked={formData.agreeToTerms}
									onChange={handleInputChange}
									required
								/>
								<Label
									className="text-gray-500 font-normal leading-normal py-2"
									htmlFor="agreeToTerms">
									I agree to receive notifications about latest
									listings, updates and recommendations via SMS and
									email.
								</Label>
							</div>
							<div id="clerk-captcha" />
							{errors ? (
								<ul className="text-red-500 text-sm mb-4">
									{errors.map((el, index) => (
										<li className="text-red-500 text-sm" key={index}>
											{el.longMessage}
										</li>
									))}
								</ul>
							) : (
								error && (
									<p className="text-red-500 text-sm mb-4">{error}</p>
								)
							)}
							<Button
								disabled={isLoading}
								onClick={handleSubmit}
								className="w-full">
								{isLoading ? "Loading..." : "Create Account"}
							</Button>

							<span className="flex items-center text-sm justify-center gap-2 text-gray-600">
								Or Already have a account
							</span>

							<Link
								href="https://accounts.gulfshoregroup.com/sign-in"
								className="flex items-center justify-center gap-2 text-red-600 font-semibold underline">
								Sign In
							</Link>
							<hr />

							<div className="flex items-center justify-between underline gap-2 text-sm text-gray-600">
								<Link href={"/terns"}>Terms</Link>

								<Link href={"/policy"}>Privacy Policy</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<div className="text-center mt-8 text-sm text-gray-500">
				<p>© GulfshoreGroup.com | All rights reserved.</p>
			</div>
		</div>
	);
}
