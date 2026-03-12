/** Alphanumeric set without ambiguous 0/O, 1/I. */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generate a short invite code (6 chars). Collision unlikely; retry on DB unique violation if needed. */
export function generateInviteCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
