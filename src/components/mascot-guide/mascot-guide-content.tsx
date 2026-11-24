"use client";

import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockHeader,
	CodeBlockLine,
	CodeBlockTitle,
} from "@/components/ui/code-block";
import { useCopy } from "@/hooks/use-copy";
import { useDownload } from "@/hooks/use-download";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import { CheckIcon, CopyIcon, DownloadIcon, FileCodeIcon } from "lucide-react";
import { useCallback } from "react";
import { MASCOT_SOURCE_CODE, USAGE_SNIPPET } from "./mascot-source";

function HighlightedBlock({ code, filename }: { code: string; filename: string }) {
	const lines = useHighlightedCode(code);

	return (
		<CodeBlock className="rounded-2xl border-border bg-background squircle:rounded-4xl">
			<CodeBlockHeader>
				<CodeBlockTitle className="text-muted-foreground">
					<FileCodeIcon aria-hidden="true" />
					{filename}
				</CodeBlockTitle>
				<CodeBlockActions>
					<CodeBlockCopyButton value={code} />
				</CodeBlockActions>
			</CodeBlockHeader>
			<CodeBlockContent wrap lineNumbers aria-label={`${filename} example code`}>
				{lines.map((line, index) => (
					<CodeBlockLine key={index}>{line}</CodeBlockLine>
				))}
			</CodeBlockContent>
		</CodeBlock>
	);
}

export function MascotGuideContent() {
	const { downloadText } = useDownload();
	const { copy, copied, failed } = useCopy();

	const handleDownloadComponent = useCallback(() => {
		downloadText(MASCOT_SOURCE_CODE, "mascot.tsx", "text/typescript");
	}, [downloadText]);

	return (
		<div className="catalog-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
			<ol className="mx-auto flex max-w-2xl flex-col gap-6 sm:gap-7">
				{/* Step 1: Get the component */}
				<li className="flex flex-col gap-1.5">
					<div className="flex items-start gap-3">
						<span
							aria-hidden="true"
							className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none"
						>
							1
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Get the component</h3>
							<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
								Download{" "}
								<button
									type="button"
									onClick={handleDownloadComponent}
									className="inline-flex cursor-pointer items-center gap-1 rounded-xs font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
								>
									<DownloadIcon className="size-3" aria-hidden="true" />
									mascot.tsx
								</button>{" "}
								(or{" "}
								<button
									type="button"
									onClick={() => copy(MASCOT_SOURCE_CODE)}
									className="inline-flex cursor-pointer items-center gap-1 rounded-xs font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
								>
									{copied ? (
										<span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
											<CheckIcon className="size-3" aria-hidden="true" />
											copied!
										</span>
									) : (
										<>
											<CopyIcon className="size-3" aria-hidden="true" />
											copy code
										</>
									)}
								</button>
								<span aria-live="polite" className="sr-only">
									{failed
										? "Couldn't copy mascot.tsx. Try downloading the file instead."
										: copied
											? "Copied mascot.tsx to clipboard"
											: ""}
								</span>
								) and add it to your project.
							</p>
						</div>
					</div>
				</li>

				{/* Step 2: Get the sprite sheets */}
				<li className="flex flex-col gap-1.5">
					<div className="flex items-start gap-3">
						<span
							aria-hidden="true"
							className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none"
						>
							2
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Get the sprite sheets</h3>
							<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
								Select any character from the grid or open the{" "}
								<span className="font-semibold text-foreground">Catalog</span> (shortcut:{" "}
								<kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
									Cmd+K
								</kbd>
								) to download their matching 3 × 3 gaze and reaction sheets.
							</p>
						</div>
					</div>
				</li>

				{/* Step 3: Put it on the page */}
				<li className="flex flex-col gap-3">
					<div className="flex items-start gap-3">
						<span
							aria-hidden="true"
							className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none"
						>
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
						<HighlightedBlock code={USAGE_SNIPPET} filename="mascot.tsx" />
					</div>
				</li>
			</ol>
		</div>
	);
}
