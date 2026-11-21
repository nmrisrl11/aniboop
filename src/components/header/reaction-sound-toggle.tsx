import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { Volume2, VolumeX } from "lucide-react";

export function ReactionSoundToggle({
	enabled,
	onToggle,
	className,
	showLabel = false,
}: {
	enabled: boolean;
	onToggle: () => void;
	className?: string;
	showLabel?: boolean;
}) {
	const { reactionSound, soundOn, soundOff } = brand.galleryControls;
	const Icon = enabled ? Volume2 : VolumeX;

	return (
		<Button
			type="button"
			variant="ghost"
			size={showLabel ? "default" : "icon"}
			className={className}
			aria-label={reactionSound}
			aria-pressed={enabled}
			title={reactionSound}
			onClick={onToggle}
		>
			<Icon aria-hidden="true" data-icon={showLabel ? "inline-start" : undefined} />
			{showLabel && (
				<>
					{reactionSound}
					<span aria-hidden="true" className="ml-auto text-xs text-muted-foreground">
						{enabled ? soundOn : soundOff}
					</span>
				</>
			)}
		</Button>
	);
}
