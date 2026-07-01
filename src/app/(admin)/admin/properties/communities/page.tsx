/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import capitalizeWords from "@/hooks/capitalizeFirstLetter";

interface Community {
	Development: string;
	name: string;
	PropertyCount: number;
	City: string;
}

export default function CommunitiesPage() {
	const [communities, setCommunities] = useState<Community[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredCommunities, setFilteredCommunities] = useState<
		Community[]
	>([]);
	const limit = 2000;

	// Fetch communities
	const fetchCommunities = async (pageNum = 1) => {
		try {
			setLoading(true);
			const res = await axios.get(
				`/api/community?page=${pageNum}&limit=${limit}`
			);
			setTotalCount(res.data.totalCount || 0);
			setCommunities(res.data.data || []);
			console.log(res.data.data);
		} catch (err: any) {
			setError(err.message || "Failed to fetch communities");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCommunities(page);
	}, []);

	const pageHandler = (pageNum: number) => {
		setPage(pageNum);
		fetchCommunities(pageNum);
	};

	const handleSearch = (term: string) => {
		setSearchTerm(term);
		if (term.trim() === "") {
			setFilteredCommunities(communities);
		} else {
			const filtered = communities.filter((community) =>
				community.Development.toLowerCase().includes(
					term.toLowerCase()
				)
			);
			setFilteredCommunities(filtered);
		}
	};
	const filteredRequest = communities?.filter((request) => {
		const matchesSearch =
			request.Development.toLowerCase().includes(
				searchTerm.toLowerCase()
			) ||
			request.name.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	const totalPages = Math.ceil(totalCount / limit);

	return (
		<div className="space-y-6 px-4 my-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">
					Communities{" "}
					{totalCount > 0 && (
						<span className="text-muted-foreground text-sm font-normal">
							({totalCount})
						</span>
					)}
				</h1>
			</div>

			{/* Search */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search communities..."
						className="pl-8"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				{loading ? (
					<div className="p-6 text-center text-muted-foreground">
						Loading...
					</div>
				) : error ? (
					<div className="p-6 text-center text-red-500">{error}</div>
				) : filteredRequest.length === 0 ? (
					<div className="p-6 text-center text-muted-foreground">
						No communities found.
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Community</TableHead>
								<TableHead>City</TableHead>

								<TableHead>Properties</TableHead>
								<TableHead className="w-[80px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredRequest.map((community, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className="font-medium">
											{capitalizeWords(community.Development)}
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{capitalizeWords(community.City)}
										</div>
									</TableCell>
									<TableCell>{community.PropertyCount}</TableCell>
									<TableCell>
										<Link
											href={`/admin/communities/${capitalizeWords(
												community.Development
											).replaceAll(" ", "-")}/edit`}>
											<Button variant="ghost" size="icon">
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						{page > 1 && (
							<PaginationItem>
								<PaginationPrevious
									onClick={() => pageHandler(page - 1)}
									className={
										page === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>
						)}

						{page < totalPages && (
							<PaginationItem>
								<PaginationNext
									onClick={() => pageHandler(page + 1)}
									className={
										page === totalPages
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
