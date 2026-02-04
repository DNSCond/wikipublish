// CooldownManager.ts

export class CooldownManager {
  #timeout: bigint;
  #inCooldown = false;
  #promise: PromiseWithResolvers<this> | undefined = undefined;
  constructor(timeout: bigint = 5000n) {
    this.#timeout = BigInt(timeout);
    if (this.#timeout < 5 || this.#timeout > 600_000n) {
      throw RangeError('this.#timeout must be within 5 and 600_000 ms');
    }
  }

  canActivate() {
    return !this.#inCooldown;
  }

  activate(startTimer: boolean = false): Promise<this> {
    if (this.#inCooldown) {
      return this.#promise!.promise;
    }
    this.#inCooldown = true;
    const { promise, resolve } = this.#promise = Promise.withResolvers();
    if (startTimer) setTimeout(() => {
      this.#inCooldown = false;
      resolve(this);
    }, Number(this.#timeout));
    return promise;
  }

  startTimer() {
    const promise = this.#promise;
    if (promise) {
      setTimeout(() => {
        this.#inCooldown = false;
        promise.resolve(this);
      }, Number(this.#timeout));
      return promise;
    } return undefined;
  }

  abort(reason: any): Promise<this> | undefined {
    this.#promise?.reject(reason);
    return this.#promise?.promise;
  }

  get promise() {
    return this.#promise?.promise;
  }
}
