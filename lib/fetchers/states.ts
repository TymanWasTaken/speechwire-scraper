import { DOMParser, HTMLDocument } from "deno_dom/deno-dom-wasm.ts";

export async function fetchStates() {
	const url =
		`https://postings.speechwire.com/p-calendar.php?tournlevelid=0&viewmode=all&Submit=View+tournaments&upcomingonly=1`;

	const res = await fetch(url);
	const html = await res.text();
	const document: HTMLDocument = new DOMParser().parseFromString(
		html,
		"text/html",
	)!;

	return [...document.querySelector("#stateid")!.children]
		.map((o) => ({
			id: o.getAttribute("value")!,
			name: o.textContent,
		}));
}
