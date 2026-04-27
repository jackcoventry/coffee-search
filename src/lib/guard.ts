const INJECTION_PATTERNS = [
  /\bignore\s+(all|previous)\s+instructions\b/i,
  /\bsystem\s+prompt\b/i,
  /\bdeveloper\s+message\b/i,
  /\byou\s+are\s+now\b/i,
  /\bact\s+as\b/i,
  /\bjailbreak\b/i,
  /\bbypass\b/i,
];

const OFFTOPIC_PATTERNS = [
  /\bcake\s+recipe\b/i,
  /\bwrite\s+a\s+poem\b/i,
  /\brelationship\s+advice\b/i,
];

const ILLEGAL_PATTERNS = [
  /\bhow\s+to\s+make\s+(fake|illegal|explosive|weapon|drugs?)\b/i,
  /\bbuy\s+(stolen|illegal|fake)\b/i,
  /\bforge\s+(documents?|passports?|signatures?|ids?)\b/i,
  /\bcredit\s+card\s+(numbers?|generator|fraud)\b/i,
  /\bsteal\b/i,
];

export function guardUserInput(query: string) {
  const q = query.trim();

  if (INJECTION_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'injection' as const };
  if (ILLEGAL_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'illegal' as const };
  if (OFFTOPIC_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'offtopic' as const };

  return { ok: true };
}
