---
gitea: none
include_toc: true
---

# Speechwire scraper

A program (and library) to scrape speechwire's server-side-rendered html pages.
I really just made this for myself so I can use [ntfy](https://ntfy.sh) to
notify myself of new PF rounds, but it probably works for other people too
¯\\\_(ツ)\_/¯

## How to use

For updated information run the help command, but here is a basic list of commands:

| Command               | Description                                                                                                                                                                                                                                                                                                        | Example                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `help` or `--help` | Show help information                                                                                                                                                                                                                                                                                                 | `--help`                                     |
| `completions`         | Generate shell completions (bash, zsh, fish)                                                                                                                                                                                                                                                                       | `completions zsh`                            |
| `notify`              | Track rounds for a specific event type of a specific tournament. If any of the options aren't provided (tournament, event type, round number to notify of), it will be prompted for interactively. Once the round is posted, it will send a notification via ntfy using the topic provided in the second argument. | `notify "John Joe" speechwire_scraper_topic` |

## Necessary permissions

The only permissions required are network permissions for the following domains:

| Domain                    | Reason                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `postings.speechwire.com` | The speechwire website is needed in order to fetch schematics and scrape the website |
| `ntfy.sh`                 | Used in order to send notifcations over ntfy                                         |