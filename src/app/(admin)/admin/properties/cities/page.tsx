"use client";

import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import capitalizeWords from "@/hooks/capitalizeFirstLetter";

interface City {
	City: string;
	PropertyCount: number;
	name: string;
}

export default function CitiesPage() {
	const [cities, setCities] = useState<City[]>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalCount, setTotalCount] = useState(0);

	const [searchTerm, setSearchTerm] = useState("");
	const filteredRequest = cities?.filter((request) => {
		const matchesSearch =
			request.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.name.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});
	const fetchCities = async () => {
		try {
			const res = await axios.get("/api/cities");
			setCities(res.data.data);
			setTotalCount(res.data.totalCount);
		} catch (error) {}
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				await fetchCities();
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="space-y-6 px-4 my-5">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">
					Cities{" "}
					<span className="text-muted-foreground text-sm font-normal">
						{totalCount !== 0 && `(${totalCount})`}
					</span>
				</h1>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						onChange={(e) => setSearchTerm(e.target.value)}
						type="search"
						placeholder="Search cities..."
						className="pl-8"
					/>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60%]">City</TableHead>
							<TableHead>Properties</TableHead>
							<TableHead className="w-[80px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRequest?.map((city, i) => (
							<TableRow key={i}>
								<TableCell>
									<div className="font-medium">
										{capitalizeWords(city.City)}
									</div>
								</TableCell>
								<TableCell>{city.PropertyCount}</TableCell>
								<TableCell>
									<Link
										href={`/admin/cities/${capitalizeWords(
											city.City
										).replaceAll(" ", "-")}/edit`}>
										<Button variant="ghost" size="icon">
											<Edit className="h-4 w-4" />
											<span className="sr-only">Edit</span>
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
