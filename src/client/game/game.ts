import { createWikipagesStructure } from "./deepseek";
import { FakeFileDirectory, FakeFileFile } from "./FakeFile";
import { navigateTo } from "@devvit/web/client";
import { replaceAnchorWith } from "./replaceAnchorWith";
import { createDetailsElementWith } from "./details";
import { jsonEncode } from "anthelpers";
const wikipageListAbort: AbortController[] = [];

export function wikipageListAbort_abort(thing?: any) {
  wikipageListAbort.forEach(aborter => aborter.abort(thing));
}

// Type for initializeWikipage
export async function initializeWikipage(ff: HTMLElement): Promise<void> {
  const fileName = ff.dataset.wikipageName;

  if (ff instanceof FakeFileFile && fileName) {
    const wikipageData = await getWikipageData(fileName);
    if (!wikipageData) return;
    const { revisionDate, content,
      revisionAuthorname, revisionReason,
      contentHTML
    } = wikipageData;
    const lastMod = revisionDate;

    const file = Object.assign(ff, { lastMod });
    file.setHeader('revision-Author-name', revisionAuthorname);
    file.setHeader('revision-Reason', revisionReason);
    file.setHeader('revision-Date', revisionDate); {
      const innerText = content || '*empty*', wikipageName = fileName;
      const pre = Object.assign(document.createElement('pre'), { innerText });
      const bu = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Load Wikipage' });
      const te = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Teleport-To' });
      const myAborter = new AbortController;
      {
        wikipageListAbort.push(myAborter, onButtonClick(bu, function () {
          if (wikipageName === undefined) {
            error.dataset.state = 'error';
            error.innerText = 'That page didnt exist, or that subreddit didnt exist';
            return;
          }
          fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString())).then(function (response) {
            const jsonic = response.json();
            if (response.ok) return jsonic;
            else throw jsonic;
          }).then(function (successResp) {
            noteTitle.value = wikipageName;
            noteBody.value = successResp.content;
          }, function (errorResp) {
            error.dataset.state = 'error';
            error.innerText = 'Something went wrong, show the developer this: ' + errorResp.error;
          });
        }));
        wikipageListAbort.push(onButtonClick(te, async function () {
          const subredditName = (await (await fetch('/api/currentSubredditName')).json()).currentSubredditName;
          if (subredditName === undefined || wikipageName === undefined) {
            error.dataset.state = 'error';
            error.innerText = 'That page didnt exist, or that subreddit didnt exist';
            return;
          }
          navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/${wikipageName}`);
        }));
      }
      file.bytesize = countUTF8Bytes(content);

      let style = '<style>a:visited,a:link{color:blue;}a:hover{color:orangered;}a:active{color:black;}:host{font-family:';
      style += 'sans-serif}pre{margin:1em 0 0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:keep-all;}</style>';
      const html = document.createElement('div');
      html.attachShadow({ mode: 'open' }).innerHTML = style + contentHTML;
      file.append(te, ' ', bu, createDetailsElementWith('RawText', {}, pre));
      console.log(content);
      try {
        const innerText = jsonEncode(JSON.parse(content), 2),
          pre = Object.assign(document.createElement('pre'), { innerText }),
          details = createDetailsElementWith('JsonText', {}, pre);
        file.append(details);
        details.style.borderTop = 'none';
      } catch { }
      file.append(html);

      {
        const { signal } = myAborter;// todo make a common operation
        Array.from(html.shadowRoot!.querySelectorAll('a'), m => m as HTMLAnchorElement).forEach(a => {
          a.addEventListener('click', function (event) {
            event.preventDefault(); wikipageListAbort_abort();
            navigateTo(a.dataset.href as string);
          }, { signal });
          const href = a.getAttribute('href');
          if (href) {
            if (href.startsWith('#')) {
              replaceAnchorWith(a);
            } else {
              const url = (new URL(href, 'https://www.reddit.com')).toString();
              a.dataset.href = url; //a.href = url; 
              a.setAttribute('href', url);
            }
          }
          a.dataset.wikipageName = wikipageName;
        });
      }
    }
  }
}

const container = document.getElementById("wikipageList")!;

function buildWikipages(strings: string[]) {
  container.append(createWikipagesStructure(strings));
}

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

const noteTitle = storeChangedOf('note-title')[1] as HTMLInputElement,
  noteBody = document.querySelector('#note-body')! as HTMLTextAreaElement,
  error = document.querySelector('#errormessage-Favicond')! as HTMLDivElement;
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

function getWikipageData(wikipageName: string): Promise<{
  content: string, revisionDate: Date, revisionAuthorname: string,
  revisionReason: string, contentHTML: string,
}> {
  return Promise.resolve(fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString()))).then(function (response) {
    const jsonic = response.json();
    if (response.ok) return jsonic;
    // else return Promise.reject(jsonic);
    else throw jsonic;
  }).then(function (successResp) {
    successResp.revisionDate = new Date(successResp.revisionDate);
    return successResp;
  }, err => err.then(console.error, console.error));
}

onButtonClick(document.querySelector('#subkit')!, async function () {
  const httpResponse = await fetch('/api/wikipost', {
    method: 'POST',
    body: JSON.stringify({
      text: noteBody.value,
      wikipageName: noteTitle.value,
    })
  });
  const jsonic = await httpResponse.json();

  if (httpResponse.ok) {
    error.dataset.state = 'success';
    error.innerText = 'successfully published';
  } else {
    error.dataset.state = 'error';
    error.innerText = 'Something went wrong, show the developer this: ' + jsonic.error;
  }
  await fetchWikipageList();
});

function onButtonClick(button: HTMLButtonElement, callback: (this: HTMLButtonElement, ev: PointerEvent | KeyboardEvent, which: 'keydown' | 'click') => any, once: boolean = false): AbortController {
  const abortController = new AbortController, { signal } = abortController;
  button.addEventListener('click', new Proxy(callback, {
    apply(target, thisArg, argumentsList) {
      return Reflect.apply(target, thisArg, [...argumentsList, 'click']);
    },
  }) as (this: HTMLButtonElement, ev: PointerEvent) => any, { signal, once });
  // button.addEventListener('keydown', function (event) {
  //   const key = event.key; if (key === 'Enter' || key === ' ') {
  //     return Reflect.apply(callback, this, [event, 'keydown']);
  //   }
  // }, { signal, once });
  return abortController;
}

function countUTF8Bytes(str: string): number {
  return (new TextEncoder).encode(str).length;
}

// function joinArrayWith<T>(array: T[], joinWith: T): T[] {
//   array = Array.from(array);
//   const result = [];
//   for (let i = 0; i < array.length; i++) {
//     result.push(array[i]);
//     if (i < array.length - 1) {
//       result.push(joinWith);
//     }
//   }
//   return result;
// }

function joinArrayWithCallback<T>(array: T[], joinWith: (val: T, index: number) => T): T[] {
  array = Array.from(array);
  const result = [];
  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    result.push(val);
    if (i < array.length - 1) {
      result.push(Reflect.apply(joinWith, result, [val, i]));
    }
  }
  return result;
}

