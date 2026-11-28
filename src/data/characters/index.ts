import fullmetalAlchemist from "./fullmetal-alchemist.json";
import blackClover from "./black-clover.json";
import attackOnTitan from "./attack-on-titan.json";
import codeGeass from "./code-geass.json";
import fairyTail from "./fairy-tail.json";
import soloLeveling from "./solo-leveling.json";
import haikyu from "./haikyu.json";
import blueLock from "./blue-lock.json";
import onePunchMan from "./one-punch-man.json";
import tokyoGhoul from "./tokyo-ghoul.json";
import demonSlayer from "./demon-slayer.json";
import onePiece from "./one-piece.json";
import naruto from "./naruto.json";
import dragonBall from "./dragon-ball.json";
import myHeroAcademia from "./my-hero-academia.json";
import deathNote from "./death-note.json";
import hunterHunter from "./hunter-hunter.json";
import bleach from "./bleach.json";
import borutoNarutoNextGenerations from "./boruto-naruto-next-generations.json";
import yuYuHakusho from "./yu-yu-hakusho.json";
import chainsawMan from "./chainsaw-man.json";
import spyFamily from "./spy-family.json";
import frierenBeyondJourneysEnd from "./frieren-beyond-journeys-end.json";
import jujutsuKaisen from "./jujutsu-kaisen.json";
import dandadan from "./dandadan.json";
import inazumaElevenGo from "./inazuma-eleven-go.json";
import mobPsycho100 from "./mob-psycho-100.json";

export type SeriesCharacter = {
	id: string;
	name: string;
	v?: string;
};

export type SeriesCatalog = {
	series: string;
	characters: readonly SeriesCharacter[];
};

export const SERIES_CATALOGS: readonly SeriesCatalog[] = [
	fullmetalAlchemist,
	blackClover,
	attackOnTitan,
	codeGeass,
	fairyTail,
	soloLeveling,
	haikyu,
	blueLock,
	onePunchMan,
	tokyoGhoul,
	demonSlayer,
	onePiece,
	naruto,
	dragonBall,
	myHeroAcademia,
	deathNote,
	hunterHunter,
	bleach,
	borutoNarutoNextGenerations,
	yuYuHakusho,
	chainsawMan,
	spyFamily,
	frierenBeyondJourneysEnd,
	jujutsuKaisen,
	dandadan,
	inazumaElevenGo,
	mobPsycho100,
];
