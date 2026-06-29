type F0IdString = `f0${number}`;
export type F0IdInput = F0Id | F0IdString | `${number}` | bigint | number;

export function isF0IdInput(input: unknown): input is F0IdInput {
  if (input instanceof F0Id) {
    return true;
  }

  if (
    typeof input !== "string" &&
    typeof input !== "bigint" &&
    typeof input !== "number"
  ) {
    return false;
  }

  try {
    F0Id.from(input);
    return true;
  } catch {
    return false;
  }
}

export class F0Id {
  public static from(input: F0Id | string | bigint | number): F0Id {
    if (input instanceof F0Id) {
      return F0Id.from(input.toBigInt());
    }

    return new F0Id(input);
  }

  private readonly bigIntValue: bigint;

  constructor(input: string | bigint | number) {
    const errorPrefix = `"${String(input)}" is not valid "f0" ID; `;

    if (typeof input !== "string") {
      try {
        const bigIntValue = BigInt(input);

        if (bigIntValue < 0n) {
          throw "ID value connot be negative";
        }

        this.bigIntValue = bigIntValue;
      } catch (error) {
        throw new TypeError(errorPrefix + String(error));
      }

      return;
    }

    const trimmedString = input.startsWith("f0") ? input.slice(2) : input;

    if (trimmedString.length === 0) {
      throw new TypeError(errorPrefix + "ID cannot be empty");
    }

    try {
      this.bigIntValue = BigInt(trimmedString);
    } catch {
      throw new TypeError(errorPrefix + "ID must be integer");
    }
  }

  public toBigInt(): bigint {
    return this.bigIntValue;
  }

  public toString(): F0IdString {
    return ("f0" + this.bigIntValue.toString()) as F0IdString;
  }
}
