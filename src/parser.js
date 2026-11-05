const GROUP_HEADER = /^party\s*\d+\s*:/i;
const TAG_PREFIX = /^@\[[^\]]*\]\s*/;
const NOISE_PREFIXES = ['tocá', 'toca', 'para salir', 'quien armó', 'quien armo'];

function isNoiseLine(line) {
  if (/[«»]/.test(line)) return true;

  const lower = line.toLowerCase();
  return NOISE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function extractPlayer(line) {
  const colon = line.indexOf(':');
  if (colon === -1) return null;

  const value = line.slice(colon + 1).trim();
  const player = value.replace(TAG_PREFIX, '').trim();

  return player || null;
}

function normalizeGroupName(line) {
  return line
    .slice(0, line.indexOf(':'))
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function parseGroups(text) {
  if (typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/);
  const hasHeaders = lines.some((line) => GROUP_HEADER.test(line.trim()));
  const groups = [];

  if (!hasHeaders) {
    groups.push({ name: 'PARTY 1', players: [] });
  }

  let current = hasHeaders ? null : groups[0];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (GROUP_HEADER.test(line)) {
      current = { name: normalizeGroupName(line), players: [] };
      groups.push(current);
      continue;
    }

    if (!current || isNoiseLine(line)) continue;

    const player = extractPlayer(line);
    if (player) current.players.push(player);
  }

  return groups;
}

export function buildInviteString(players) {
  return players
    .map((player) => `{WAITMS100}{RETURN}{WAITMS100}/invite ${player}{WAITMS100}{RETURN}`)
    .join('');
}
