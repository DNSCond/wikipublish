// import { ExoticArrayManager } from "./ExoticArrayManager";

export function replaceAnchorWith(anchor: HTMLAnchorElement): HTMLSpanElement {
    const a = anchor, href = a.getAttribute('href');
    const child = document.createElement('span');
    child.style.textDecoration = 'underline';
    child.replaceChildren(...a.childNodes);
    child.setAttribute('data-computed-href', a.href);
    child.setAttribute('data-original-href', `${href}`);
    a.replaceWith(child);
    return child;
}

// export class HyperLinkGroup extends ExoticArrayManager<HTMLAnchorElement> {
//     #abortController = new AbortController;
//     get abortController() {
//         return this.#abortController;
//     }
// }
