"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditSearchModalProps {
	search: {
		_id: string;
		name: string;
		link: string;
		lastUpdated: string;
		filters: Record<string, any>;
		matchCount: number;
		icon: string;
	};
	isOpen: boolean;
	onClose: () => void;
	onUpdate: (updatedSearch: any) => void;
}

export default function EditSearchModal({
	search,
	isOpen,
	onClose,
	onUpdate,
}: EditSearchModalProps) {
	const [name, setName] = useState(search.name);
	const [subscriptionEnabled, setSubscriptionEnabled] =
		useState(true);
	const [subscriptionFrequency, setSubscriptionFrequency] =
		useState("Instant");

	if (!isOpen) return null;

	const handleUpdate = () => {
		onUpdate({
			...search,
			name,
			subscriptionFrequency,
			subscriptionEnabled,
		});
		onClose();
	};

	return (
		<>
			<div
				className="fixed inset-0 bg-black/50 z-40"
				onClick={onClose}
			/>

			<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg z-50 w-full max-w-md p-6 space-y-6">
				<div>
					<h2 className="text-2xl font-bold text-foreground">
						Edit saved search
					</h2>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-foreground">
						Name
					</label>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="border border-border bg-background text-foreground"
						placeholder="Search name"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-foreground">
						For Sale
					</label>
					<div className="text-sm text-muted-foreground">
						{search.link}
					</div>
				</div>

				<div className="space-y-4 border-t border-border pt-4">
					<div className="space-y-2">
						<label className="text-sm font-semibold text-foreground">
							Subscription
						</label>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								On
							</span>
							<button
								onClick={() =>
									setSubscriptionEnabled(!subscriptionEnabled)
								}
								className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
									subscriptionEnabled ? "bg-blue-600" : "bg-gray-300"
								}`}>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										subscriptionEnabled
											? "translate-x-6"
											: "translate-x-1"
									}`}
								/>
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<select
							value={subscriptionFrequency}
							onChange={(e) =>
								setSubscriptionFrequency(e.target.value)
							}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option value="Instant">Instant</option>
							<option value="Daily">Daily</option>
							<option value="Weekly">Weekly</option>
						</select>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-border">
					<Button
						onClick={onClose}
						variant="outline"
						className="border border-border text-foreground hover:bg-gray-100 bg-transparent">
						Cancel
					</Button>
					<Button
						onClick={handleUpdate}
						className="bg-blue-500 hover:bg-blue-600 text-white">
						Update
					</Button>
				</div>
			</div>
		</>
	);
}
