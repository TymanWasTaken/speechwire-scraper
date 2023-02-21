import {
  DOMParser,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import {
  judgeRegex,
  tableHeaderRegex,
  teamRegex,
  tournamentUrlRegex,
} from "./regex.ts";
import { Matching, RoundData } from "./types.ts";

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
    schematicsUrl: url
  };

  for (const table of tables) {
    const rows = [...table.childNodes];

    const header = rows[0].textContent.match(tableHeaderRegex)!;

    const matchingRows = rows.slice(2);
    let bye: string[] | null = null;
    const matches: Matching[] = matchingRows.map((row) => {
      if (row.childNodes[0].textContent == "BYE") {
        const team = row.childNodes[3].textContent.match(teamRegex)!.groups!
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

export async function fetchTournaments(stateId: string, showOld: boolean) {
  const url =
    `https://postings.speechwire.com/p-calendar.php?stateid=${stateId}&tournlevelid=0&Submit=View+tournaments&upcomingonly=${showOld ? 0 : 1}`;

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
