// details

export function createDetailsElementWith(summery: string, options: undefined |
{ setOpen?: boolean, className?: string, classArray?: string[] }, ...rest: (HTMLElement | string | Node)[]): HTMLDetailsElement {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const content = document.createElement('div');
    summary.textContent = summery;
    content.className = 'content';
    content.append(...rest);
    details.append(summary, content);
    if (options) {
        details.open = Boolean(options.setOpen);
        if (options.className) {
            details.className = options.className;
        }
        if (Array.isArray(options.classArray)) {
            options.classArray.forEach(className => details.classList.add(className));
        }
    }
    details.setAttribute('style', 'border: solid black 2px; padding: 0.5em;');
    content.setAttribute('style', 'margin-top: 1em; white-space: pre-wrap; overflow-wrap: anywhere; word-break: keep-all;');
    return details;
}
