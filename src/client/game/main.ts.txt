import { FakeFileFile } from "./FakeFile";
import { navigateTo } from "@devvit/web/client";

const wikipageElement = document.querySelector('#wikipageList')!;
const wikipageListAbort: AbortController[] = [];
async function wikipageListUpdate() {
  wikipageListAbort.forEach(aborter => aborter.abort());
  wikipageListAbort.length = 0; wikipageElement.replaceChildren();
  const wikipageList = (await (await fetch('/api/wikipageList')).json());
  (wikipageList.pages as string[]).forEach(async fileName => {
    const { revisionDate, content,
      revisionAuthorname, revisionReason
    } = await getWikipageData(fileName), lastMod = revisionDate;

    const file = Object.assign(new FakeFileFile, { fileName, lastMod });
    file.setHeader('revision-Author-name', revisionAuthorname);
    file.setHeader('revision-Reason', revisionReason);
    file.setHeader('revision-Date', revisionDate); {
      const innerText = content || '*empty*', wikipageName = fileName;
      const pre = Object.assign(document.createElement('pre'), { innerText });
      const bu = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Load Wikipage' });
      const te = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Teleport-To' });
      pre.prepend(te, ' ', bu, '\n\n');
      {
        wikipageListAbort.push(onButtonClick(bu, function () {
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
      file.append(pre); wikipageElement.append(file);
    }

    // const details = document.createElement('details');
    // const summary = Object.assign(document.createElement('summary'), { innerText });
    // const content = document.createElement('div'); details.append(summary, content);
    // const li = document.createElement('li'); li.append(details); summary.style.padding = '0.5em 0';
    // const bu = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Load Wikipage' });
    // const te = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Teleport-To' });
    // Object.assign(bu.dataset, { wikipageName: innerText }); Object.assign(te.dataset, { wikipageName: innerText });
    // content.prepend(te, ' ', bu); li.className = 'wikipageListing';

    // wikipageListAbort.push(onButtonClick(bu, function () {
    //   const wikipageName = this?.dataset?.wikipageName;
    //   if (wikipageName === undefined) {
    //     error.dataset.state = 'error';
    //     error.innerText = 'That page didnt exist, or that subreddit didnt exist';
    //     return;
    //   }
    //   fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString())).then(function (response) {
    //     const jsonic = response.json();
    //     if (response.ok) return jsonic;
    //     else throw jsonic;
    //   }).then(function (successResp) {
    //     noteBody.value = successResp.content;
    //   }, function (errorResp) {
    //     error.dataset.state = 'error';
    //     error.innerText = 'Something went wrong, show the developer this: ' + errorResp.error;
    //   });
    // }));
    // wikipageListAbort.push(onButtonClick(te, async function () {
    //   const wikipageName = this?.dataset?.wikipageName;
    //   const subredditName = (await (await fetch('/api/currentSubredditName')).json()).currentSubredditName;
    //   if (subredditName === undefined || wikipageName === undefined) {
    //     error.dataset.state = 'error';
    //     error.innerText = 'That page didnt exist, or that subreddit didnt exist';
    //     return;
    //   }
    //   navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/${wikipageName}`);
    // }));
    // array.push(li);
  });
} wikipageListUpdate();
const noteBody = document.querySelector('#note-body')! as HTMLTextAreaElement,
  noteTitle = document.querySelector('#note-title')! as HTMLInputElement,
  error = document.querySelector('#errormessage-Favicond')! as HTMLDivElement;
noteBody.addEventListener('change', function () {
  localStorage.setItem('autosave', noteBody.value);
}); noteBody.value = localStorage.getItem('autosave') || '';

function getWikipageData(wikipageName: string): Promise<{ content: string, revisionDate: Date, revisionAuthorname: string, revisionReason: string, }> {
  return fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString())).then(function (response) {
    const jsonic = response.json();
    if (response.ok) return jsonic;
    else throw jsonic;
  }).then(function (successResp) {
    successResp.revisionDate = new Date(successResp.revisionDate);
    return successResp;
  }, console.error);
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
  } await wikipageListUpdate();
});
function onButtonClick(button: HTMLButtonElement, callback: (this: HTMLButtonElement, ev: PointerEvent | KeyboardEvent, which: 'keydown' | 'click') => any, once: boolean = false): AbortController {
  const abortController = new AbortController, { signal } = abortController;
  button.addEventListener('click', new Proxy(callback, {
    apply(target, thisArg, argumentsList) {
      return Reflect.apply(target, thisArg, [...argumentsList, 'click']);
    },
  }) as (this: HTMLButtonElement, ev: PointerEvent) => any, { signal, once });
  button.addEventListener('keydown', function (event) {
    const key = event.key; if (key === 'Enter' || key === ' ') {
      return Reflect.apply(callback, this, [event, 'keydown']);
    }
  }, { signal, once });
  return abortController;
}

function countUTF8Bytes(str: string): number {
  return (new TextEncoder).encode(str).length;
}

