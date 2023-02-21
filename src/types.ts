export interface RoundData {
  roundCount: number;
  rounds: {
    number: number;
    time: string;
    matchings: Matching[];
    bye: string[] | null;
  }[];
  schematicsUrl: string;
}

export interface Matching {
  judges: string[];
  room: string;
  teamOne: string[];
  teamTwo: string[];
}
