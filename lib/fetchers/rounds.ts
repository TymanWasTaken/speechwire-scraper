import { DOMParser, HTMLDocument } from "deno_dom/deno-dom-wasm.ts";
import { judgeRegex, tableHeaderRegex, teamRegex } from "../utils/regex.ts";
import { Matching, RoundData } from "../utils/types.ts";

export async function fetchRounds(eventId: number, tournamentId: number) {
	const url =
		`https://postings.speechwire.com/c-postings-schem.php?groupingid=${eventId}&Submit=View+postings&tournid=${tournamentId}`;

	const res = await fetch(url);
	const html = await res.text();
	const document: HTMLDocument = new DOMParser().parseFromString(
		html,
		"text/html",
	)!;

	const tables = document.querySelectorAll("table.publicschematic > tbody");

	const roundData: RoundData = {
		roundCount: 0,
		rounds: [],
		schematicsUrl: url,
	};

	for (const table of tables) {
		const rows = [...table.childNodes];

		const header = rows[0].textContent.match(tableHeaderRegex)!;

		const matchingRows = rows.slice(2);
		let bye: string[] | null = null;
		const matches: Matching[] = matchingRows.map((row) => {
			if (row.childNodes[0].textContent == "BYE") {
				const team = row.childNodes[3].textContent.match(teamRegex)!.groups!;
				bye = [
					team.personOne,
					team.personTwo,
				];
				return null;
			}
			const teamOne = row.childNodes[3].textContent.match(teamRegex)!.groups!;
			const teamTwo = row.childNodes[4].textContent.match(teamRegex)!.groups!;
			return {
				judges: [...row.childNodes[1].childNodes].filter((n) => n.nodeType == 3)
					.map((n) => n.textContent.match(judgeRegex)!.groups!.name),
				room: row.childNodes[2].textContent,
				teamOne: [
					teamOne.personOne,
					teamOne.personTwo,
				],
				teamTwo: [
					teamTwo.personOne,
					teamTwo.personTwo,
				],
			};
		}).filter((r) => r != null) as Matching[];
		roundData.roundCount++;
		roundData.rounds.push({
			number: Number(header.groups!.roundNumber),
			time: header.groups!.time,
			matchings: matches,
			bye,
		});
	}
	return roundData;
}
