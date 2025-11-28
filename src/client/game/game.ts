import { createWikipagesStructure } from "./deepseek";
import { FakeFileDirectory, FakeFileFile } from "./FakeFile";
import { navigateTo } from "@devvit/web/client";
import { replaceAnchorWith } from "./replaceAnchorWith";
import { createDetailsElementWith } from "./details";
import { jsonEncode } from "anthelpers";
import { ClockTime, RelativeTime } from "datetime_global/RelativeTimeChecker";
import { getISOWeek } from "../isoWek";
import { Datetime_global, Datetime_global_constructor } from "datetime_global/Datetime_global";
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
            addErrorMessage(false, `Error: That page didnt exist, or that subreddit didnt exist`);
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
            addErrorMessage(false, `Error: ${'Something went wrong, show the developer this: ' + errorResp.error}`);
          });
        }));
        wikipageListAbort.push(onButtonClick(te, async function () {
          const subredditName = (await (await fetch('/api/currentSubredditName')).json()).currentSubredditName;
          if (subredditName === undefined || wikipageName === undefined) {
            addErrorMessage(false, `Error: That page didnt exist, or that subreddit didnt exist`);
            return;
          }
          navigateTo(`https://old.reddit.com/r/${subredditName}/wiki/${wikipageName}`);
        }));
      }
      file.bytesize = countUTF8Bytes(content);

      let style = '<style>a:visited,a:link{color:blue;}a:hover{color:orangered;}a:active{color:black;}:host{font-family:';
      style += 'sans-serif}pre{margin:1em 0 0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:keep-all;}';
      style += 'ul{padding-left:2ch;}</style>';
      const html = document.createElement('div'); html.setAttribute('style', 'overflow:scroll;');
      html.attachShadow({ mode: 'open' }).innerHTML = style + contentHTML;
      file.append(te, ' ', bu, createDetailsElementWith('RawText', {}, pre));
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
              const urlObject = new URL(href, 'https://old.reddit.com'),
                url = urlObject.toString();
              a.dataset.href = url; //a.href = url; 
              a.setAttribute('href', url);
              if (urlObject.hostname === 'clock.ant.ractoc.com') {
                const date = new Date(urlObject.searchParams.get('t') ?? NaN);
                if (!isNaN(date as unknown as number)) {
                  let replacement; const dateTime = date.toISOString(),
                    replType = urlObject.searchParams.get('type')?.toLowerCase(),
                    formatDefault = urlObject.searchParams.get('format'),
                    format = urlObject.searchParams.get('format-custom');
                  if (format) {
                    replacement = new ClockTime(date);
                    replacement.setAttribute('format', format.replaceAll(/o/g, `${getISOWeek(date).year}`));
                  } else if (formatDefault) {
                    const format = formatDefault.trim().toUpperCase();
                    replacement = new ClockTime(date); let resultFormat: string | null = 'D M Y-m-d \\TH:i:s (e)';
                    switch (format.replace(/^(?:FORMAT_?)/i, '')) {
                      case "TOSTRING": // toString
                      case "DATEV1":
                        resultFormat = Datetime_global.FORMAT_DATEV1;
                        break;
                      case "DATETIME_GLOBALV4":
                        resultFormat = 'D M Y-m-d \\TH:i:s (e)';
                      case "DATETIME_GLOBALV3":
                        resultFormat = Datetime_global.FORMAT_DATETIME_GLOBALV3;
                        break;
                      case "DATETIME_GLOBALV2":
                        resultFormat = Datetime_global.FORMAT_DATETIME_GLOBALV2;
                        break;
                      case "DATETIME_GLOBALV1":
                        resultFormat = Datetime_global.FORMAT_DATETIME_GLOBALV1;
                        break;
                      case "MYSQLI":
                        resultFormat = Datetime_global.FORMAT_MYSQLI;
                        break;
                      case "TOISOSTRING":
                      case "TOJSON":
                        resultFormat = null;
                        {
                          const textContent = dateTime;
                          replacement = Object.assign(document.createElement("time"), { textContent, dateTime });
                        }
                        break;
                      case "TOUTCSTRING":
                        resultFormat = null;
                        {
                          const textContent = date.toUTCString();
                          replacement = Object.assign(document.createElement("time"), { textContent, dateTime });
                        }
                        break;
                      case "TOTIMESTRING":
                        resultFormat = 'H:i:s (e)';
                        break;
                      case "TODATESTRING":
                        resultFormat = 'D M m Y';
                        break;
                      case "OFFSET_FROM_NOW":
                        resultFormat = null;
                        replacement = new RelativeTime(date);
                        break;
                    }
                    if (resultFormat) {
                      if (format.startsWith('FORMAT_')) {
                        resultFormat = (Datetime_global[format as keyof Datetime_global_constructor] as string) ?? resultFormat;
                      } else resultFormat = resultFormat;
                      replacement.setAttribute('format', resultFormat);
                    }
                  } else switch (replType) {
                    case "relative":
                      replacement = new RelativeTime(date);//document.createElement("relative-time");
                      // replacement.setAttribute('datetime', dateTime);
                      break;
                    default:
                      replacement = Object.assign(document.createElement("time"), { dateTime });
                      if (url === a.innerHTML) {
                        replacement.innerText = date.toString().slice(0, 33);
                      } else {
                        replacement.replaceChildren(...a.childNodes);
                      }
                  }
                  replacement.setAttribute('data-href', url);
                  a.replaceChildren(replacement);
                } return;
              }
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

const errormessage_Reddcond = document.querySelector('#errormessage-Reddcond')! as FakeFileDirectory;
{
  const error = addErrorMessage(true, `Errors and Successes will be logged here, but only for this session.`);
  error.backgroundColor = '#ffd2d2';
  error.fileName = 'Infomation';
}
function addErrorMessage(success: boolean, message: string | Error): FakeFileFile {
  const error = new FakeFileFile, pre = document.createElement('pre'); // @ts-expect-error
  error.fileName = success ? 'Success' : (message?.name ?? 'Error');
  error.append(pre); pre.innerText = `${message}`;
  errormessage_Reddcond.prepend(error);
  return error;
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

const noteTitle = storeChangedOf('note-title')[1] as HTMLInputElement,
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
  const bodyJS = {
    text: noteBody.value,
    wikipageName: noteTitle.value,
  }, body = JSON.stringify(bodyJS);
  const httpResponse = await fetch('/api/wikipost', { method: 'POST', body });
  const jsonic = await httpResponse.json();

  if (httpResponse.ok) {
    addErrorMessage(true, `Success: successfully published "/${bodyJS.wikipageName}"`);
  } else {
    addErrorMessage(false, `Error: ${'Something went wrong, show the developer this: ' + jsonic.error}`);
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

// function joinArrayWithCallback<T>(array: T[], joinWith: (val: T, index: number) => T): T[] {
//   array = Array.from(array);
//   const result = [];
//   for (let i = 0; i < array.length; i++) {
//     const val = array[i];
//     result.push(val);
//     if (i < array.length - 1) {
//       result.push(Reflect.apply(joinWith, result, [val, i]));
//     }
//   }
//   return result;
// }
