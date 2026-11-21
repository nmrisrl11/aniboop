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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import { brand } from "@/lib/brand";
import { Code2 } from "lucide-react";

const copy = brand.componentGuide;
const CODE_SNIPPET = `import { Mascot } from "@/components/mascot/mascot";

export function MascotDemo() {
  return (
    <Mascot
      preview="/mascots/previews/edward.webp"
      directions="/mascots/gallery-sheets/edward-directions.webp"
      reactions="/mascots/gallery-sheets/edward-reactions.webp"
      label="Edward Elric"
      size={168}
      mode="cycle"
      trackPointer
    />
  );
}`;

function MascotExample() {
	const lines = useHighlightedCode(CODE_SNIPPET);

	return (
		<CodeBlock className="rounded-xl bg-background corner-squircle">
			<CodeBlockHeader className="border-b border-border bg-muted/50 px-3 py-2 sm:px-4">
				<CodeBlockTitle className="font-mono text-xs">mascot-demo.tsx</CodeBlockTitle>
				<CodeBlockActions>
					<CodeBlockCopyButton value={CODE_SNIPPET} size="icon" />
				</CodeBlockActions>
			</CodeBlockHeader>
			<CodeBlockContent wrap className="text-xs sm:text-sm">
				{lines.map((line, index) => (
					<CodeBlockLine key={index}>{line}</CodeBlockLine>
				))}
			</CodeBlockContent>
		</CodeBlock>
	);
}

export function ComponentDocsModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label={copy.trigger}
					className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground duration-150 hover:bg-muted hover:text-foreground motion-safe:active:scale-[0.97] max-[420px]:size-7 max-[420px]:px-0"
				>
					<Code2 aria-hidden="true" />
					<span className="hidden sm:inline">{copy.trigger}</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-2xl">
				<DialogHeader className="border-b border-border">
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>{copy.description}</DialogDescription>
				</DialogHeader>

				<div className="catalog-scrollbar min-h-0 overflow-y-auto overscroll-contain">
					<div className="flex flex-col gap-6 p-4 sm:p-6">
						<MascotExample />

						<section className="flex flex-col gap-2">
							<h3 className="text-sm font-semibold">{copy.propsTitle}</h3>
							<dl className="divide-y divide-border text-sm">
								{copy.props.map(([name, description]) => (
									<div key={name} className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
										<dt>
											<code className="font-mono text-xs">{name}</code>
										</dt>
										<dd className="text-muted-foreground">{description}</dd>
									</div>
								))}
							</dl>
						</section>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
