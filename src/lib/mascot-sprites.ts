export const REACTIONS = [
	"blink",
	"heart",
	"sparkle",
	"surprised",
	"wink",
	"bashful",
	"sleepy",
	"dizzy",
	"delighted",
] as const;

export type Reaction = (typeof REACTIONS)[number];
