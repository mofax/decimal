export const Bigmath = {
    abs(x: bigint): bigint {
        return x < 0n ? -x : x;
    }
} as const;
