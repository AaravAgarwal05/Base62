const BASE = 62n;
const LENGTH = 6n;
const MOD = BASE ** LENGTH;

const PRIME = 19260817n;
const INVERSE = 4022397873n;

if((PRIME * INVERSE) % MOD !== 1n) {
    throw new Error("PRIME and INVERSE are not modular inverses under MOD");
}

export function obfuscate(id: bigint): bigint {
    if(id < 0n || id >= MOD) {
        throw new RangeError(`ID must be in range [0, ${MOD})`);
    }

    return (id * PRIME) % MOD;
}

export function deobfuscate(obfId: bigint): bigint {
    if(obfId < 0n || obfId >= MOD) {
        throw new RangeError(`Obfuscated ID must be in range [0, ${MOD})`);
    }

    return (obfId * INVERSE) % MOD;
}

