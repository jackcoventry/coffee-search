const INJECTION_PATTERNS = [
  /\bignore\s+(all|previous)\s+instructions\b/i,
  /\b(disregard|forget|override)\s+(all|previous|prior)\s+instructions\b/i,
  /\bsystem\s+prompt\b/i,
  /\bdeveloper\s+message\b/i,
  /\bshow\s+(me\s+)?(your\s+)?(instructions|prompt|system\s+message)\b/i,
  /\breveal\s+(your\s+)?(instructions|prompt|system\s+message|chain\s+of\s+thought)\b/i,
  /\byou\s+are\s+now\b/i,
  /\bact\s+as\b/i,
  /\bjailbreak\b/i,
  /\bbypass\b/i,
  /\bdo\s+anything\s+now\b/i,
];

const OFFTOPIC_PATTERNS = [
  /\bcake\s+recipe\b/i,
  /\b(write|draft|compose)\s+(a\s+)?(poem|essay|email|cover\s+letter|song|rap)\b/i,
  /\bwrite\s+a\s+poem\b/i,
  /\brelationship\s+advice\b/i,
  /\bhomework\s+(answer|answers|help)\b/i,
  /\bmedical\s+advice\b/i,
  /\blegal\s+advice\b/i,
  /\binvestment\s+advice\b/i,
];

const ILLEGAL_PATTERNS = [
  /\bhow\s+to\s+make\s+(fake|illegal|explosive|weapon|drugs?)\b/i,
  /\bbuy\s+(stolen|illegal|fake)\b/i,
  /\bforge\s+(documents?|passports?|signatures?|ids?)\b/i,
  /\bcredit\s+card\s+(numbers?|generator|fraud)\b/i,
  /\b(carding|credential\s+stuffing|phishing|ransomware|malware|keylogger|botnet)\b/i,
  /\b(sql\s+injection|xss|cross-site\s+scripting)\b/i,
  /\b(passwords?|api\s+keys?|private\s+keys?|seed\s+phrases?)\b/i,
  /\bmake\s+(a\s+)?(bomb|explosive|weapon|gun|meth|drugs?)\b/i,
  /\bsmuggle|money\s+launder(?:ing)?|shoplift(?:ing)?\b/i,
  /\bsteal\b/i,
];

const ABUSE_PATTERNS = [
  /\b(kill|murder|assault|doxx|swat)\s+(someone|a\s+person|my|their|them)\b/i,
  /\b(nude|porn|sex|sexual|explicit)\b/i,
  /\b(hate\s+speech|racial\s+slur|slurs?)\b/i,
];

export function guardUserInput(query: string) {
  const q = query.trim();

  if (INJECTION_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'injection' as const };
  if (ILLEGAL_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'illegal' as const };
  if (ABUSE_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'abuse' as const };
  if (OFFTOPIC_PATTERNS.some((r) => r.test(q))) return { ok: false, reason: 'offtopic' as const };

  return { ok: true };
}
