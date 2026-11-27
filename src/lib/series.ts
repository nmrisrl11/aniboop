export type SeriesOption = {
	slug: string;
	series: string;
	count: number;
};

export function slugifySeries(series: string): string {
	return series
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/['’]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function buildSeriesOptions(
	characters: readonly { series: string }[],
): readonly SeriesOption[] {
	const counts = new Map<string, number>();
	for (const character of characters) {
		counts.set(character.series, (counts.get(character.series) ?? 0) + 1);
	}

	return Array.from(counts, ([series, count]) => ({
		slug: slugifySeries(series),
		series,
		count,
	})).sort((a, b) => a.series.localeCompare(b.series));
}
