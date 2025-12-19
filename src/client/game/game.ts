import { createWikipagesStructure } from "./deepseek";
import { FakeFileDirectory, FakeFileFile } from "./FakeFile";
import { onButtonClick } from "./helpers";
import "./imageHandler";
import { addErrorMessage } from "./wikipage/error.message";
import { container } from "./wikipage/main";


fetchWikipageList();
async function fetchWikipageList() {
  return fetch('/api/wikipageList').then(resp => resp.json()).then(m => {
    const ul = document.createElement('ul') as HTMLUListElement,
      directory = document.createElement("ff-f") as FakeFileFile;
    ul.replaceChildren(...Array.from(m.pages, innerText =>
      Object.assign(document.createElement('li'), { innerText })));
    directory.replaceChildren(ul);
    // directory.replaceChildren(...joinArrayWithCallback<string | HTMLBRElement>(m.pages, () => document.createElement('br')));
    container.replaceChildren(directory);
    directory.fileName = '/wikipages.list';
    directory.backgroundColor = '#ffd2d2';

    // container.append(
    //   createAccouncement('custom Editors', [
    //     createParagraph(
    //       'if you want to add a custom editor for your wikipage configuration ',
    //       createLink('https://www.reddit.com/message/compose/?to=antboiy&subject=Please%20Add%20My%20Custom%20wikipage%20format%20into%20u%2Fwikipublish',
    //         'message u/antboiy with the request').tag, '. im willing to add most schemas as long as its plaintext preferably json, and can be put in wikipages'
    //     )], { AccouncementDate: new Date('2025-12-03T17:39:10Z') }),
    // );

    return buildWikipages(Array.from(m.pages, m => `${m}`));//.split(/\//g)
  }, err => {
    const directory = document.createElement("ff-d") as FakeFileDirectory;
    directory.isexpanded = true;
    const content = document.createElement("ff-f");
    content.setAttribute("ff-name", "Error");
    content.setAttribute("data-wikipage-name", "Error");
    directory.append(content); directory.fileName = '/';
    content.innerText = `${err}`;
    container.replaceChildren(directory);
  });
}

(function () {
  const output = document.querySelector('#datetime-output')! as HTMLOutputElement,
    a = document.createElement('a'); output.append(a)
  document.querySelector('input[type=Datetime-local]')!.addEventListener('change', update);
  function update(this: HTMLInputElement) {
    const outp = new URLSearchParams; outp.set('t', (new Date(this.value)).toISOString());
    a.innerText = a.href = `https://clock.ant.ractoc.com/?${outp}`;
  }
})();

export const noteTitle = storeChangedOf('note-title')[1] as HTMLInputElement,
  noteBody = document.querySelector('#note-body')! as HTMLTextAreaElement;
// error = document.querySelector('#errormessage-Favicond')! as HTMLDivElement;
function storeChangedOf(id: string): [(autosaveString: string) => undefined, HTMLElement & { value: string }] {
  if (typeof id !== "string") throw new TypeError('storeChangedOf expects a string');
  const element = document.getElementById(id) as HTMLElement & { value: string };
  if (element === null) {
    throw new TypeError(`element of Id "${id}" doesnt exist.`);
  } id = 'autosave,' + id;
  element.addEventListener('change', function () {
    localStorage.setItem(id, element.value);
  }); element.value = localStorage.getItem(id) || '';
  return [(autosaveString => void localStorage.setItem(id, autosaveString)), element];
}

noteBody.addEventListener('change', function () {
  localStorage.setItem('autosave', noteBody.value);
}); noteBody.value = localStorage.getItem('autosave') || '';

onButtonClick(document.querySelector('#subkit')!, async function () {
  const bodyJS = {
    text: noteBody.value,
    wikipageName: noteTitle.value,
  }, body = JSON.stringify(bodyJS);
  const httpResponse = await fetch('/api/wikipost', { method: 'POST', body });
  const jsonic = await httpResponse.json();

  if (httpResponse.ok) {
    addErrorMessage(true, `Success: successfully published "/${jsonic.wikipageName}"`,
       `Success: successfully published "/${jsonic.wikipageName}"`);
  } else {
    addErrorMessage(false, `Error: ${'Something went wrong, show the developer this: ' + jsonic.error}`, 
      `Error: Something went wrong when publishing "/${bodyJS.wikipageName}"`);
  }
  await fetchWikipageList();
});

function buildWikipages(strings: string[]) {
  container.append(createWikipagesStructure(strings));
}
