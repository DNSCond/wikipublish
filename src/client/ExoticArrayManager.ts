// ExoticArrayManager
export class ExoticArrayManager<T> {
    #array: T[];

    constructor(of: T[] | number = 0, comparitor: (any: any) => boolean = (_any: any) => true) {
        if (typeof of === 'number') {
            this.#array = Array(of);
        } else {
            this.#array = Array.from(of).filter(comparitor);
        }
    }

    get length(): number {
        return this.#array.length;
    }

    set length(newLength: number) {
        if (!Number.isSafeInteger(newLength) || newLength < 0) {
            throw new RangeError('length must be a safe postive integer');
        }
        const array = this.#array;
        const oldLength = array.length;
        array.length = newLength;
        array.forEach((element, index) => {
            if (!(element instanceof HTMLAnchorElement))
                Reflect.deleteProperty(array, index);
        });
        if (newLength < oldLength) {
            getDeletionIndexes(oldLength, newLength).forEach(toDelete => Reflect.deleteProperty(this, toDelete));
        } else if (newLength > oldLength) {
            getAdditionIndexes(oldLength, newLength).forEach(toDefine => Reflect.defineProperty(this, toDefine, {
                get() { return array[toDefine]; }, set(value) { array[toDefine] = value; },
                configurable: true, enumerable: true,
            }));
        }
    }

    *[Symbol.iterator]() {
        yield* this.#array;
    }
}

function getDeletionIndexes(oldV: number, newV: number): number[] {
    const result = [];
    for (let i = oldV - 1; i >= newV; i--) { // <- oldV - 1, not oldV
        result.push(i);
    }
    return result;
}

function getAdditionIndexes(oldV: number, newV: number): number[] {
    const result = [];
    for (let i = oldV; i < newV; i++) { // <- oldV to newV-1
        result.push(i);
    }
    return result;
}
