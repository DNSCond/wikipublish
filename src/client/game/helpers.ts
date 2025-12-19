// helpets/tx
export function today() {
  return ((new Date).toISOString()).slice(0, 10);
}

export function countItems(of: Iterable<any>, item: any) {
  let count = 0;
  for (let object of Array.from(of)) {
    count += +(object === item);
  } return count;
}

export function chunkArray<T>(arr: T[], lengthPerItem: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += lengthPerItem) {
    chunks.push(arr.slice(i, i + lengthPerItem));
  }
  return chunks;
}

export function chunkAndTransform<Old, New = Old>(
  arr: Old[], lengthPerItem: number, transform: (item: Old) => New,
): New[][] {
  const chunks: New[][] = [];
  for (let i = 0; i < arr.length; i += lengthPerItem) {
    const chunk = arr.slice(i, i + lengthPerItem);
    chunks.push(chunk.map(transform));
  }
  return chunks;
}

export function* enumerate<T>(array: T[]): Generator<{ element: T; index: number, inArray: boolean }, void, unknown> {
  for (let index = 0; index < array.length; index++) {
    yield { index, element: array[index] as T, inArray: index in array };
  }
}

export function onButtonClick(button: HTMLButtonElement, callback: (this: HTMLButtonElement, ev: PointerEvent | KeyboardEvent, which: 'keydown' | 'click') => any, once: boolean = false): AbortController {
  const abortController = new AbortController, { signal } = abortController;
  button.addEventListener('click', new Proxy(callback, {
    apply(target, thisArg, argumentsList) {
      return Reflect.apply(target, thisArg, [...argumentsList, 'click']);
    },
  }) as (this: HTMLButtonElement, ev: PointerEvent) => any, { signal, once });

  return abortController;
}

