import { DOMParser, HTMLDocument } from "deno_dom/deno-dom-wasm.ts";
import { tournamentUrlRegex } from "../utils/regex.ts";

export async function fetchTournaments(stateId: string, showOld: boolean) {
	const url =
		`https://postings.speechwire.com/p-calendar.php?stateid=${stateId}&tournlevelid=0&Submit=View+tournaments&upcomingonly=${
			showOld ? 0 : 1
		}`;

	const res = await fetch(url);
	const html = await res.text();
	const document: HTMLDocument = new DOMParser().parseFromString(
		html,
		"text/html",
	)!;

	const tournaments =
		// Select all children of the table listing tournaments
		[...document.querySelector(".bluetable > tbody")!.children]
			// Filter out header rows
			.filter((c) => ![...c.children[0].classList].includes("tableheader"));

	return tournaments.map((t) => ({
		id: t.children[1].children?.[0]?.getAttribute("href")?.match(
			tournamentUrlRegex,
		)?.groups?.id ?? null,
		date: t.children[0].textContent,
		name: t.children[1].textContent,
		location: t.children[5].textContent,
	}));
}
