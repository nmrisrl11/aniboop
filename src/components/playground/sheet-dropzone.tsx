"use client";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	UploadIcon,
	XIcon,
	type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";

export type UploadedSheet = {
	url: string;
	name: string;
	width: number;
	height: number;
};

type SheetDropzoneProps = {
	label: string;
	hint: string;
	icon: LucideIcon;
	sheet: UploadedSheet | null;
	error: string | null;
	onFilesSelected: (files: FileList | File[]) => void;
	onRemove: () => void;
};

const ACCEPTED_TYPES = "image/png,image/webp,image/jpeg,image/avif";
const copy = brand.playground;

export function SheetDropzone({
	label,
	hint,
	icon: Icon,
	sheet,
	error,
	onFilesSelected,
	onRemove,
}: SheetDropzoneProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const dragDepth = useRef(0);
	const [isDragging, setIsDragging] = useState(false);

	const isNonSquare = sheet !== null && sheet.width !== sheet.height;

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (files && files.length > 0) {
			onFilesSelected(files);
		}
		event.target.value = "";
	}

	function handleDragEnter(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		dragDepth.current += 1;
		setIsDragging(true);
	}

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = "copy";
	}

	function handleDragLeave(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		dragDepth.current = Math.max(0, dragDepth.current - 1);
		if (dragDepth.current === 0) {
			setIsDragging(false);
		}
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		dragDepth.current = 0;
		setIsDragging(false);
		if (event.dataTransfer.files.length > 0) {
			onFilesSelected(event.dataTransfer.files);
		}
	}

	return (
		<div
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={cn(
				"rounded-xl border p-3 transition-[border-color,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] corner-squircle motion-reduce:transition-none squircle:rounded-3xl",
				isDragging
					? "border-primary bg-primary/8 ring-2 ring-primary/25"
					: error
						? "border-destructive/60 bg-destructive/5"
						: sheet
							? "border-border bg-muted/35"
							: "border-dashed border-input/70 bg-muted/20",
			)}
		>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept={ACCEPTED_TYPES}
				multiple
				onChange={handleInputChange}
				className="sr-only"
			/>

			{sheet ? (
				<div className="flex items-center gap-3">
					<div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-background corner-squircle squircle:rounded-xl">
						<Image
							src={sheet.url}
							alt={`${label} sheet preview`}
							width={56}
							height={56}
							unoptimized
							className="size-full object-contain"
							draggable={false}
						/>
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5">
							<CheckCircle2Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
							<span className="text-xs font-semibold text-foreground">{label}</span>
							<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
								{sheet.width}×{sheet.height}
							</span>
						</div>
						<p className="mt-0.5 truncate text-xs text-muted-foreground" title={sheet.name}>
							{sheet.name}
						</p>
						<div className="mt-1.5 flex items-center gap-1.5">
							<Button
								type="button"
								variant="outline"
								size="xs"
								onClick={() => inputRef.current?.click()}
								className="transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
							>
								<UploadIcon className="size-3" aria-hidden="true" />
								{copy.replaceSheet}
							</Button>
						</div>
					</div>

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={onRemove}
						aria-label={`${copy.removeSheet} ${label}`}
						title={copy.removeSheet}
						className="self-start text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.95] motion-reduce:transition-none motion-reduce:active:scale-100"
					>
						<XIcon className="size-4" aria-hidden="true" />
					</Button>
				</div>
			) : (
				<label
					htmlFor={inputId}
					className={cn(
						"group flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-[transform,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] corner-squircle focus-within:ring-3 focus-within:ring-ring active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-xl",
						isDragging ? "text-primary" : "text-muted-foreground hover:text-foreground",
					)}
				>
					<span
						className={cn(
							"flex size-11 shrink-0 items-center justify-center rounded-lg border transition-[border-color,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] corner-squircle motion-reduce:transition-none squircle:rounded-xl",
							isDragging
								? "border-primary/40 bg-primary/15 text-primary"
								: "border-border bg-card text-muted-foreground group-hover:border-primary/40 group-hover:text-primary",
						)}
					>
						{isDragging ? (
							<UploadIcon className="size-4.5" aria-hidden="true" />
						) : (
							<Icon className="size-4.5" aria-hidden="true" />
						)}
					</span>
					<span className="min-w-0 flex-1">
						<span className="flex items-center justify-between gap-2">
							<span className="text-sm font-semibold text-foreground">{label}</span>
							<span className="text-[11px] font-medium text-primary">
								{isDragging ? copy.dropActive : copy.dropPrompt}
							</span>
						</span>
						<span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
					</span>
				</label>
			)}

			{isNonSquare && (
				<p
					role="status"
					className="mt-2 flex items-start gap-1.5 px-1 text-xs text-amber-700 dark:text-amber-300"
				>
					<AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
					<span>{copy.nonSquareWarning}</span>
				</p>
			)}

			{error && (
				<p role="alert" className="mt-2 flex items-start gap-1.5 px-1 text-xs text-destructive">
					<AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
					<span>{error}</span>
				</p>
			)}
		</div>
	);
}
