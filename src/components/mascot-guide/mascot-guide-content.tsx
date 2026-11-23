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
import { Check, Copy, Download, FileCodeIcon } from "lucide-react";
import { useCallback } from "react";
import { MASCOT_SOURCE_CODE, USAGE_SNIPPET } from "./mascot-source";

function HighlightedBlock({ code, filename }: { code: string; filename: string }) {
	const lines = useHighlightedCode(code);

	return (
		<CodeBlock className="rounded-4xl border border-border bg-background text-foreground corner-squircle">
			<CodeBlockHeader>
				<CodeBlockTitle className="text-muted-foreground">
					<FileCodeIcon />
					{filename}
				</CodeBlockTitle>
				<CodeBlockActions>
					<CodeBlockCopyButton value={code} />
				</CodeBlockActions>
			</CodeBlockHeader>
			<CodeBlockContent wrap lineNumbers>
				{lines.map((line, index) => (
					<CodeBlockLine key={index}>{line}</CodeBlockLine>
				))}
			</CodeBlockContent>
		</CodeBlock>
	);
}

export function MascotGuideContent() {
	const { downloadText } = useDownload();
	const { copy, copied } = useCopy();

	const handleDownloadComponent = useCallback(() => {
		downloadText(MASCOT_SOURCE_CODE, "mascot.tsx", "text/typescript");
	}, [downloadText]);

	return (
		<div className="catalog-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
			<div className="mx-auto flex max-w-2xl flex-col gap-6 sm:gap-7">
				{/* Step 1: Get the component */}
				<section className="flex flex-col gap-1.5">
					<div className="flex items-start gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none">
							1
						</span>
						<div className="flex-1">
							<h3 className="text-sm font-bold text-foreground">Get the component</h3>
							<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
								Download{" "}
								<button
									type="button"
									onClick={handleDownloadComponent}
									className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
								>
									<Download className="size-3" aria-hidden="true" />
									mascot.tsx
								</button>{" "}
								(or{" "}
								<button
									type="button"
									onClick={() => copy(MASCOT_SOURCE_CODE)}
									className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
								>
									{copied ? (
										<span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
											<Check className="size-3" aria-hidden="true" />
											copied!
										</span>
									) : (
										<>
											<Copy className="size-3" aria-hidden="true" />
											copy code
										</>
									)}
								</button>
								) and add it to your project.
							</p>
						</div>
					</div>
				</section>

				{/* Step 2: Get the sprite sheets */}
				<section className="flex flex-col gap-1.5">
					<div className="flex items-start gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background select-none">
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
						<HighlightedBlock code={USAGE_SNIPPET} filename="mascot.tsx" />
					</div>
				</section>
			</div>
		</div>
	);
}
