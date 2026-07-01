"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { Users, Building, Zap, Heart, MapPin, Home, Phone, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashBoardStats {
	TotalSocialLogs: number;
	TotalUsers: number;
	TotalWishlistedProperties: number;
	TotalPropertyViews: number;
	TotalProperties: number;
	TotalContacts: number;
	TotalCities: number;
	TotalCommunities: number;
	TotalTours: number;
	LastSocialMediaUploadTime: string;
}

export default function DashboardPage() {
	const [data, setData] = useState<DashBoardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("/api/admin/dashboard");
				setData(res.data.data);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg text-muted-foreground animate-pulse">Loading dashboard...</p>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg text-red-500">Failed to load dashboard data.</p>
			</div>
		);
	}

	const statCards = [
		{
			label: "Total Users",
			value: data.TotalUsers,
			icon: <Users className="h-5 w-5 text-emerald-600" />,
			color: "text-emerald-600",
			onClick: () => router.push("/admin/users"),
		},
		{
			label: "Properties",
			value: data.TotalProperties,
			icon: <Home className="h-5 w-5 text-pink-700" />,
			color: "text-pink-700",
			onClick: () => router.push("/admin/properties"),
		},
		{
			label: "Contact Requests",
			value: data.TotalContacts,
			icon: <Phone className="h-5 w-5 text-blue-600" />,
			color: "text-blue-600",
			onClick: () => router.push("/admin/contact-requests"),
		},
		{
			label: "Cities",
			value: data.TotalCities,
			icon: <MapPin className="h-5 w-5 text-green-700" />,
			color: "text-green-700",
			onClick: undefined,
		},
		{
			label: "Communities",
			value: data.TotalCommunities,
			icon: <Building className="h-5 w-5 text-blue-900" />,
			color: "text-blue-900",
			onClick: undefined,
		},
		{
			label: "Tour Requests",
			value: data.TotalTours,
			icon: <Calendar className="h-5 w-5 text-rose-700" />,
			color: "text-rose-700",
			onClick: undefined,
		},
		{
			label: "Saved Properties",
			value: data.TotalWishlistedProperties,
			icon: <Heart className="h-5 w-5 text-red-500" />,
			color: "text-red-500",
			onClick: () => router.push("/admin/wishlist"),
		},
		{
			label: "Property Views",
			value: data.TotalPropertyViews,
			icon: <Building className="h-5 w-5 text-indigo-600" />,
			color: "text-indigo-600",
			onClick: undefined,
		},
	];

	return (
		<div className="space-y-6 p-2">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground mt-1">Overview of your Gulfshore Group platform</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{statCards.map((card) => (
					<Card
						key={card.label}
						onClick={card.onClick}
						className={card.onClick ? "cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40" : ""}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{card.label}
							</CardTitle>
							{card.icon}
						</CardHeader>
						<CardContent>
							<div className={`text-3xl font-bold ${card.color}`}>
								{card.value?.toLocaleString() ?? "—"}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
