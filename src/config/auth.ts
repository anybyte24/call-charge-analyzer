export const ALLOWED_EMAILS = [
  "amministrazione@anybyte.it",
] as const;

export type AllowedEmail = typeof ALLOWED_EMAILS[number];
