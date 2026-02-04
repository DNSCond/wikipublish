// jsonToHTML
export function jsonToHTML(mixed: any) {
  const doc = new DocumentFragment;
  let depth = 0;
  doc.append(inner(mixed, depth));
  return doc;
  function inner(mixed: any, depth: number) {
    const json = Object.assign(document.createElement('div'), { className: `jsonToHTML depth-${depth} div` });
    json.dataset.depth = depth.toString();
    if (mixed === null) {
      json.dataset.jsType = 'null';
      return Object.assign(json, { textContent: 'null' });
    }
    switch (json.dataset.jsType = typeof mixed) {
      case "undefined":
        json.dataset.jsType = 'undefined';
        return Object.assign(json, { textContent: 'undefined' });
      case "string":
      case "number":
      case "bigint":
      case "symbol":
      case "boolean": {
        json.dataset.jsType = typeof mixed;
        const textContent = String(mixed);
        return Object.assign(json, { textContent });
      }
      case "function": {
        const json = Object.assign(document.createElement('pre'), { className: `jsonToHTML depth-${depth} pre` });
        json.dataset.jsType = 'function';
        const textContent = String(mixed);
        return Object.assign(json, { textContent });
      }
    }
    if (Array.isArray(mixed)) {
      const array = Object.assign(document.createElement('ol'), { className: `jsonToHTML depth-${depth} ol` }),
        length = mixed.length; array.dataset.length = length.toString();
      for (let index = 0; index < length; index++) {
        const li = Object.assign(document.createElement('li'), { className: `jsonToHTML depth-${depth} li` });
        li.append(inner(mixed[index], depth + 1)); li.value = +index;array.append(li);
      }
      return array;
    }
    const object = Object.assign(document.createElement('dl'), { className: `jsonToHTML depth-${depth} dl` });
    for (let [key, val] of Object.entries(mixed)) {
      const dt = Object.assign(document.createElement('dt'), { className: `jsonToHTML depth-${depth} dt` }),
        dd = Object.assign(document.createElement('dd'), { className: `jsonToHTML depth-${depth} dd` });
      dt.textContent = key;
      dt.dataset.key = key;
      dd.dataset.key = key;
      dd.append(inner(val, depth + 1));
      object.append(dt, dd);
    } return object;
  }
}
