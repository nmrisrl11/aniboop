import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { CSSProperties } from "react";

let highlighter: Promise<HighlighterCore> | undefined;

export async function highlightTsx(code: string) {
	highlighter ??= createHighlighterCore({
		themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
		langs: [import("shiki/langs/tsx.mjs")],
		engine: createJavaScriptRegexEngine({ forgiving: true }),
	}).catch((error: unknown) => {
		highlighter = undefined;
		throw error;
	});

	const shiki = await highlighter;
	const { tokens } = shiki.codeToTokens(code, {
		lang: "tsx",
		themes: { light: "github-light", dark: "github-dark" },
		defaultColor: false,
	});
	return tokens.map((line) =>
		line.map((token, index) => (
			<span
				key={index}
				style={token.htmlStyle as CSSProperties}
				className="text-(--shiki-light) dark:text-(--shiki-dark)"
			>
				{token.content}
			</span>
		)),
	);
}
