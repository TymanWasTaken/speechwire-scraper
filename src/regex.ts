export const tableHeaderRegex =
  /Round (?<roundNumber>\d) - (?<time>\d?\d:\d\d)/;
export const judgeRegex = /(?<code>\d{1,2}\w) (?<name>.+)/;
export const teamRegex =
  /(?<code>\d{1,2}\w) (?<personOne>[\w\-]+ [\w\-]+) and (?<personTwo>[\w\-]+ [\w\-]+) ?(?:\((?<side>\w+)\))?/;
export const tournamentUrlRegex =
  /https:\/\/www\.speechwire\.com\/c-info\.php\?tournid=(?<id>\d+)/;
