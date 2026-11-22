"use client";

import { Button } from "@/components/ui/button";
import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockHeader,
	CodeBlockLine,
	CodeBlockTitle,
} from "@/components/ui/code-block";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import { Check, Copy, Download, FileCode2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MASCOT_SOURCE_CODE, USAGE_SNIPPET } from "./mascot-source";

function HighlightedBlock({ code, filename }: { code: string; filename: string }) {
	const lines = useHighlightedCode(code);

	return (
		<CodeBlock className="rounded-xl border border-border bg-muted/40 text-foreground shadow-2xs corner-squircle dark:border-neutral-800 dark:bg-neutral-950">
			<CodeBlockHeader className="border-b border-border bg-muted/60 px-3 py-2 sm:px-4 dark:border-neutral-800 dark:bg-neutral-900/90">
				<CodeBlockTitle className="font-mono text-xs text-muted-foreground dark:text-neutral-300">
					{filename}
				</CodeBlockTitle>
				<CodeBlockActions>
					<CodeBlockCopyButton
						value={code}
						size="icon-xs"
						className="text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-neutral-200"
					/>
				</CodeBlockActions>
			</CodeBlockHeader>
			<CodeBlockContent
				wrap
				className="code-scrollbar font-mono text-xs leading-relaxed text-foreground sm:text-[13px] dark:text-neutral-200"
			>
				{lines.map((line, index) => (
					<CodeBlockLine key={index}>{line}</CodeBlockLine>
				))}
			</CodeBlockContent>
		</CodeBlock>
	);
}

export function MascotGuideContent() {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleDownloadComponent = useCallback(() => {
		const blob = new Blob([MASCOT_SOURCE_CODE], {
			type: "text/typescript;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "mascot.tsx";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, []);

	const handleCopyComponent = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(MASCOT_SOURCE_CODE);
			setCopied(true);
		} catch {
			// Clipboard write fallback
		}
	}, []);

	return (
		<div className="catalog-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
			<div className="mx-auto flex max-w-2xl flex-col gap-6 sm:gap-7">
				{/* Step 1: Get the component */}
				<section className="flex flex-col gap-3">
					<div className="flex items-start gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none">
							1
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Get the component</h3>
							<p className="mt-0.5 text-xs text-muted-foreground">
								Self-contained React component with cursor gaze tracking, hold &amp; pinch gestures,
								and squash animations — zero external dependencies.
							</p>
						</div>
					</div>

					<div className="pl-9">
						{/* Component Download Card */}
						<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs corner-squircle sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<div className="flex min-w-0 items-center gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground corner-squircle">
									<FileCode2 className="size-5 text-primary" aria-hidden="true" />
								</div>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="truncate font-mono text-xs font-semibold text-foreground">
											mascot.tsx
										</span>
										<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
											TypeScript
										</span>
									</div>
									<p className="mt-0.5 truncate text-[11px] text-muted-foreground">
										~14 KB · Zero dependencies · Fully typed
									</p>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<Button
									variant="default"
									size="sm"
									onClick={handleDownloadComponent}
									className="h-8 gap-1.5 text-xs font-medium transition-transform active:scale-98"
								>
									<Download data-icon="inline-start" aria-hidden="true" className="size-3.5" />
									Download mascot.tsx
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCopyComponent}
									className="h-8 gap-1.5 text-xs font-medium transition-transform active:scale-98"
								>
									{copied ? (
										<Check
											data-icon="inline-start"
											aria-hidden="true"
											className="size-3.5 text-emerald-500"
										/>
									) : (
										<Copy data-icon="inline-start" aria-hidden="true" className="size-3.5" />
									)}
									{copied ? "Copied" : "Copy code"}
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Step 2: Get the sprite sheets */}
				<section className="flex flex-col gap-3">
					<div className="flex items-start gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none">
							2
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Get the sprite sheets</h3>
							<p className="mt-0.5 text-xs text-muted-foreground">
								Every mascot uses two matching 3 × 3 WebP sheets: nine gaze directions and nine
								emotional reactions.
							</p>
						</div>
					</div>

					<div className="pl-9">
						<div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-2xs corner-squircle">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary corner-squircle">
								<Sparkles className="size-4.5" aria-hidden="true" />
							</div>
							<p className="text-xs leading-relaxed text-muted-foreground">
								Select any character from the home grid (or open the{" "}
								<span className="font-semibold text-foreground">Catalog</span> via{" "}
								<kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
									Cmd+K
								</kbd>
								) to view their details and download their matching high-res sheets.
							</p>
						</div>
					</div>
				</section>

				{/* Step 3: Put it on the page */}
				<section className="flex flex-col gap-3">
					<div className="flex items-start gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none">
							3
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Put it on the page</h3>
							<p className="mt-0.5 text-xs text-muted-foreground">
								Place your downloaded sprite sheets into your project&apos;s public directory and
								render the mascot:
							</p>
						</div>
					</div>

					<div className="pl-9">
						<HighlightedBlock code={USAGE_SNIPPET} filename="my-mascot.tsx" />
					</div>
				</section>
			</div>
		</div>
	);
}
