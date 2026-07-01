"use client";

import { useState } from "react";
import {
	ChevronRight,
	Bell,
	Trash2,
	Phone,
	Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditSearchModal from "@/components/edit-search-modal";

interface SavedSearchCardProps {
	search: {
		_id: string;
		name: string;
		filters: Record<string, any>;
		lastUpdated: string;
		matchCount: number;
		icon: string;
		link: string;
	};
	onUpdate?: (search: any) => void;
	onDelete?: (id: string) => void;
}

export default function SavedSearchCard({
	search,
	onUpdate,
	onDelete,
}: SavedSearchCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleEditClick = () => {
		setIsModalOpen(true);
	};

	const handleUpdate = (updatedSearch: any) => {
		onUpdate?.(updatedSearch);
	};

	return (
		<>
			<Card className="p-5 hover:shadow-lg transition-shadow group">
				<div className="space-y-4">
					<div
						className="flex items-start cursor-pointer justify-between"
						onClick={handleEditClick}>
						<h4 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors pr-2">
							{search.name}
						</h4>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 opacity-0 group-hover:opacity-100"
							onClick={(e) => {
								e.stopPropagation();
								onDelete?.(search._id);
							}}>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>

					<p
						onClick={handleEditClick}
						className="text-sm cursor-pointer text-muted-foreground">
						{search.link}
					</p>

					<div className="pt-3 border-t border-border flex justify-between items-center">
						<div className="flex text-sm flex-col font-medium gap-0.5">
							<span>Dimitri Schwarz</span>
							<span>+1 239-992-9119</span>
							<span>mailbox@gulfshoregroup.com</span>
						</div>

						<div className="flex flex-row gap-2">
							<a
								href="tel:+1 239-992-9119"
								className="hover:underline bg-primary cursor-pointer text-white p-2 rounded-full font-medium">
								<Phone size={18} />
							</a>

							<a
								href="mailto:mailbox@gulfshoregroup.com"
								className="hover:underline cursor-pointer rounded-full bg-primary text-white p-2 font-medium">
								<Mail size={18} />
							</a>
						</div>
					</div>
				</div>
			</Card>

			<EditSearchModal
				search={search}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onUpdate={handleUpdate}
			/>
		</>
	);
}
