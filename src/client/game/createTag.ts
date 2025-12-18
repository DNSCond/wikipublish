import { attachNavigateToAchorTag } from "./attachNavigateToAchorTag";
import { FakeFileFile } from "./FakeFile";

export function createAccouncement(name: string, nodes: (HTMLElement | string)[], headers: Record<string, string | Date> = {}): FakeFileFile {
  const file = document.createElement("ff-f") as FakeFileFile;
  file.fileName = name; file.append(...nodes);
  file.backgroundColor = '#ffd2d2';
  file.setHeaders(headers);
  return file;
}

export function createLink(hrefTo: string | URL, ...innerNodes: (HTMLElement | string)[]) {
  const anchor = document.createElement('a');
  anchor.href = `${hrefTo}`; anchor.append(...innerNodes);
  anchor.className = 'createAnchor createdElement';
  return attachNavigateToAchorTag(anchor, false);
}

export function createParagraph(...innerNodes: (HTMLElement | string)[]) {
  const paragraph = document.createElement('p');
  paragraph.className = 'createParagraph createdElement';
  paragraph.append(...innerNodes);
  return paragraph;
}