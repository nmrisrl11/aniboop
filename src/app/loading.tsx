import { BloomImageLoader } from "@/components/ui/image-loader";
import { brand } from "@/lib/brand";

export default function Loading() {
	return (
		<main aria-busy="true" className="flex min-h-dvh items-center justify-center p-6">
			<div className="size-16">
				<BloomImageLoader label={brand.statusPages.loading.label} />
			</div>
		</main>
	);
}
