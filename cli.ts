import {
    Command,
    CompletionsCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import {
    Number as NumberPrompt,
    Select as SelectPrompt,
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import {
    fetchEventTypes,
    fetchRounds,
    fetchStates,
    fetchTournaments,
} from "./src/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/colors.ts";
import { NotificationPriority, sendNotification } from "./src/ntfy.ts";

await new Command()
    // Globals
    .name("speechwire")
    .version("0.1.0")
    .description("Scrapes the speechwire website")
    .globalOption("-v, --verbose", "Enable verbose logging")
    // Completions command (shell completions)
    .command("completions", new CompletionsCommand())
    // Notify command
    .command("notify")
    .description("Starts tracking speechwire, notifying on new rounds")
    .option("-t, --tournament <tournament:number>", "Tournament ID")
    .option("-e, --event <event:number>", "Event ID")
    .option("-r, --round <round:number>", "Round to notify for")
    .option("-o, --old-tournaments", "Whether or not to display old tournaments in the picker")
    .option(
        "-d, --delay <delay:number>",
        "Delay to wait between scrapes (milliseconds)",
        {
            default: 2000,
        },
    )
    .arguments("<person:string> <topic:string>")
    .action(async (options, ...args) => {
        let maxPromptRows = Deno.consoleSize().rows;

        if (options.tournament === undefined) {
            const states = await fetchStates();
            const stateId = await SelectPrompt.prompt({
                message: "Choose a state",
                options: states.map((s) => ({
                    name: s.name,
                    value: s.id,
                })),
                search: true,
                maxRows: --maxPromptRows
            });

            const tournaments = await fetchTournaments(stateId, options.oldTournaments ?? false);
            const tournamentId = await SelectPrompt.prompt({
                message: "Select a tournament",
                options: tournaments.filter((t) => t.id != null).map((t) => ({
                    name: `${t.name} - ${t.location}`,
                    value: t.id!,
                })),
                search: true,
                maxRows: --maxPromptRows
            });
            options.tournament = Number(tournamentId);
        }

        if (!options.event) {
            const events = await fetchEventTypes(options.tournament);
            const eventId = await SelectPrompt.prompt({
                message: "Choose an event",
                options: events.map((e) => ({
                    name: e.name,
                    value: e.id,
                })),
                search: true,
                maxRows: --maxPromptRows
            });
            options.event = Number(eventId);
        }

        if (!options.round) {
            const round = await NumberPrompt.prompt("What round should be notified");
            options.round = round;
        }

        console.log(
            colors.bold.yellow("Watching..."),
        );
        while (true) {
            if (options.verbose) console.log("Starting fetch...");
            const roundInfo = await fetchRounds(options.event, options.tournament);
            // If the round isn't posted yet, wait and then continue
            if (roundInfo.roundCount < options.round) {
                if (options.verbose) console.log("No new round found");
                await new Promise((r) => setTimeout(r, options.delay));
                continue;
            }
            const round = roundInfo.rounds[options.round - 1];
            // Check if person got the bye
            if (round.bye?.includes(args[0])) {
                console.log(
                    colors.bold.brightRed(`${round.bye.join(" and ")} got the bye!`),
                );
                await sendNotification(args[1], {
                    title: `Round ${options.round} posted`,
                    message: `Round ${options.round} was posted, but ${round.bye.join(" and ")} got the bye`,
                    click: roundInfo.schematicsUrl,
                    priority: NotificationPriority.High
                })
                Deno.exit(0);
            }
            const matching = round.matchings.find(
                m => 
                    m.teamOne.includes(args[0])
                    || m.teamTwo.includes(args[0])
            )
            if (matching) {
                console.log(
                    colors.bold.brightGreen(`Round ${round.number} posted!`),
                );
                console.log(
                    colors.brightCyan(`Room: ${matching.room}\nTeam one: ${matching.teamOne.join(" and ")}\nTeam two: ${matching.teamTwo.join(" and ")}\nJudge(s): ${matching.judges.join(", ")}`)
                )
                await sendNotification(args[1], {
                    title: `Round ${options.round} posted`,
                    message: `Room ${matching.room}: ${matching.teamOne.join(" and ")} vs. ${matching.teamTwo.join(" and ")} (${matching.judges.join(", ")} judging)`,
                    click: roundInfo.schematicsUrl,
                    priority: NotificationPriority.High
                })
            } else {
                console.log(
                    colors.bold.brightRed(`Round ${options.round} was posted, but ${args[0]} was not matched`),
                );
                await sendNotification(args[1], {
                    title: `Round ${options.round} posted`,
                    message: `Round ${options.round} was posted, but ${args[0]} was not matched`,
                    click: roundInfo.schematicsUrl,
                    priority: NotificationPriority.High
                })
            }
            Deno.exit(0);
        }
    })
    // Parse
    .parse(Deno.args);
