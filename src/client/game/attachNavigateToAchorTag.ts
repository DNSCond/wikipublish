import { navigateTo } from "@devvit/web/client";

// is a common operation

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

export function attachNavigateToAchorTag(a: HTMLAnchorElement, replaceIfHashURL: boolean = true): { abortController: AbortController, tag: HTMLAnchorElement | HTMLSpanElement } {
  const abortController = new AbortController, { signal } = abortController;
  a.addEventListener('click', function (event) {
    event.preventDefault();
    navigateTo(a.dataset.href as string);
  }, { signal });
  const href = a.getAttribute('href');
  let tag: HTMLAnchorElement | HTMLSpanElement = a;
  if (href) {
    if (href.startsWith('#') && replaceIfHashURL) {
      tag = replaceAnchorWith(a);
    } else {
      const url = (new URL(href, 'https://www.reddit.com')).toString();
      a.dataset.href = url; //a.href = url; 
      a.setAttribute('href', url);
    }
  }
  return { abortController, tag };
}
