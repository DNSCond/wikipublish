// TableConstructor.ts

export type RowData = Record<string, string | Node | (string | Node)[]>; // key → cell value

export class TableConstructor {
  #dataset: string[] = [];
  public readonly table: HTMLTableElement;

  constructor(headers: Record<string, string>) {
    this.table = document.createElement('table');

    // Lock the table reference (optional, as before)
    Object.defineProperty(this, 'table', {
      writable: false,
      configurable: false,
      enumerable: true,
    });

    const headerRow = document.createElement('tr');

    headerRow.append(
      ...Object.entries(headers).map(([key, textContent]) => {
        const th = document.createElement('th');
        th.dataset.key = key;       // optional dataset for reference
        this.#dataset.push(key);    // maintain column order
        return Object.assign(th, { textContent, scope: 'col' });
      })
    );

    this.table.append(headerRow);
  }

  /**
   * Adds a row to the table.
   * @param data Object mapping keys to cell values
   * @returns The newly created <tr> element
   */
  createRow(data: RowData): HTMLTableRowElement {
    const row = document.createElement('tr');

    for (const key of this.#dataset) {
      const textContent = Reflect.get(data, key);
      const td = document.createElement('td');
      if (textContent instanceof Node) {
        td.append(textContent);
        row.append(td);
        continue;
      } else if (Array.isArray(textContent)) {
        td.append(...textContent);
        row.append(td);
        continue;
      }
      row.append(Object.assign(td, { textContent }));
    }

    this.table.append(row);
    return row;
  }

  /**
   * Returns the HTML string of the table.
   */
  toString(): string {
    return this.table.outerHTML;
  }
}
