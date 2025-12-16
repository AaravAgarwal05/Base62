const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = BigInt(ALPHABET.length);

if (ALPHABET.length !== 62) {
  throw new Error("BASE62_ALPHABET must be exactly 62 characters long");
}

export function encodeBase62(num: bigint): string {
  if (num < 0n) {
    throw new Error("Number must be non-negative");
  }

  if (num === 0n) {
    return ALPHABET[0];
  }

  let result = "";
  let n = num;

  while (n > 0n) {
    const remainder = n % BASE;
    result = ALPHABET[Number(remainder)] + result;
    n = n / BASE;
  }

  return result;
}

export function decodeBase62(str: string): bigint {
  let result = 0n;

  for (const char of str) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid character '${char}' in base62 string`);
    }
    result = result * BASE + BigInt(index);
  }

  return result;
}
