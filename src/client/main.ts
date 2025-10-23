import { navigateTo } from "@devvit/web/client";

const wikipageElement = document.querySelector('#wikipageList')!;
const wikipageListUl: AbortController[] = [];
async function wikipageListUpdate() {
  wikipageListUl.forEach(aborter => aborter.abort());
  wikipageListUl.length = 0; const array: HTMLLIElement[] = [];
  const wikipageList = (await (await fetch('/api/wikipageList')).json());
  (wikipageList.pages as string[]).forEach(innerText => {
    const li = Object.assign(document.createElement('li'), { innerText });
    const bu = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Load Wikipage' });
    const te = Object.assign(document.createElement('button'), { type: 'button', innerText: 'Teleport-To' });
    Object.assign(bu.dataset, { wikipageName: innerText }); Object.assign(te.dataset, { wikipageName: innerText });
    li.prepend(te, ' ', bu, ': ',);
    wikipageListUl.push(onButtonClick(bu, function () {
      const wikipageName = this?.dataset?.wikipageName;
      if (wikipageName === undefined) {
        error.dataset.state = 'error';
        error.innerText = 'That page didnt exist, or that subreddit didnt exist';
        return;
      }
      fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString())).then(function (response) {
        const jsonic = response.json();
        if (response.ok) return jsonic; else throw jsonic;
      }).then(function (successResp) {
        noteBody.value = successResp.content;
      }, function (errorResp) {
        error.dataset.state = 'error';
        error.innerText = 'Something went wrong, show the developer this: ' + errorResp.error;
      });
    }));
    wikipageListUl.push(onButtonClick(te, async function () {
      const wikipageName = this?.dataset?.wikipageName;
      const subredditName = (await (await fetch('/api/currentSubredditName')).json()).currentSubredditName;
      if (subredditName === undefined || wikipageName === undefined) {
        error.dataset.state = 'error';
        error.innerText = 'That page didnt exist, or that subreddit didnt exist';
        return;
      }
      navigateTo(`https://www.reddit.com/r/${subredditName}/wiki/${wikipageName}`);
    }));
    array.push(li);
  }); wikipageElement.replaceChildren(...array);
} wikipageListUpdate();
const noteBody = document.querySelector('#note-body')! as HTMLTextAreaElement,
  noteTitle = document.querySelector('#note-title')! as HTMLInputElement,
  error = document.querySelector('#errormessage-Favicond')! as HTMLDivElement;
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
