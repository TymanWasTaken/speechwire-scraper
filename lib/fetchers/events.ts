import { DOMParser, HTMLDocument } from "deno_dom/deno-dom-wasm.ts";

export async function fetchEventTypes(tournamentId: number) {
	const url =
		`https://postings.speechwire.com/c-postings-schem.php?tournid=${tournamentId}`;

	const res = await fetch(url);
	const html = await res.text();
	const document: HTMLDocument = new DOMParser().parseFromString(
		html,
		"text/html",
	)!;

	const typeOptions = [...document.querySelector("#groupingid")!.children];

	return typeOptions.map((e) => ({
		id: e.getAttribute("value")!,
		name: e.textContent,
	}));
}
