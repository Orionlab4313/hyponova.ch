declare module "mailcheck" {
  type Suggestion = {
    full: string;
    address: string;
    domain: string;
  };
  type RunOpts = {
    email: string;
    domains?: string[];
    secondLevelDomains?: string[];
    topLevelDomains?: string[];
    distanceFunction?: (a: string, b: string) => number;
    suggested?: (suggestion: Suggestion) => void;
    empty?: () => void;
  };
  interface MailcheckStatic {
    run(opts: RunOpts): void;
    suggest(
      email: string,
      domains: string[],
      secondLevelDomains: string[],
      topLevelDomains: string[],
      distanceFunction?: (a: string, b: string) => number
    ): Suggestion | null;
  }
  const Mailcheck: MailcheckStatic;
  export = Mailcheck;
}
