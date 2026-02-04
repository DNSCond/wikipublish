import { navigateTo, showToast } from "@devvit/web/client";
import { noteBody, noteTitle } from "../game";
import { TableConstructor } from "../TableConstructor";
import { RelativeTime } from "datetime_global/src/RelativeTimeChecker";
import { addErrorMessage } from "./error.message";
import { jsonEncode } from "anthelpers";
import { CooldownManager } from "../CooldownManager";
import { attachAnchors } from "./main";

export const table = document.getElementById("Revisions")! as HTMLDivElement;
export const button = document.getElementById("Revision")! as HTMLButtonElement;
export const template = document.getElementById("template")! as HTMLTemplateElement;
export const templateVision = (document.getElementById("templateVision")! as HTMLDivElement).attachShadow({ mode: 'open' });
button.addEventListener('click', getWikipageRevisions);

const inLoadingOperation = new CooldownManager(500n),
  inButtonOperation = new CooldownManager(500n);

let abortController: AbortController | null;
export function getWikipageRevisions() {
  if (!inLoadingOperation.canActivate()) return;
  inLoadingOperation.activate();
  const wikipageName = noteTitle.value, space = '\x20';
  showToast(`Loading Revision History of "${wikipageName}"`);
  table.innerHTML = '';
  const urlsearch = new URLSearchParams({ wikipageName });
  fetch('/api/wikipageRevisions?' + urlsearch.toString()).then(function (response) {
    const jsonic = response.json();
    if (response.ok) return jsonic;
    else throw jsonic;
  }).then(({ wikipageRevisions }) => {
    abortController?.abort();
    const { signal } = abortController = new AbortController;
    const tableConstructor = new TableConstructor({
      // page: 'Wikipage Name',
      reason: 'Revision Reason',
      date: 'Revisioned At',
      author: 'Revisioner',
      buttons: "Options",
    }); table.append(tableConstructor.table);
    for (const element of wikipageRevisions) {
      const datetime = datetimeBugFix(element.date),
        buttons = document.createElement('span');
      element.date = new RelativeTime(datetime);
      element.author = element.author.username;
      element.buttons = buttons;
      tableConstructor.createRow(element)
        .setAttribute('data-revision-id',
          element.id);
      const button = document.createElement('button'),
        viewContentSource = document.createElement('button');
      button.addEventListener('click', async function () {
        inButtonOperation.activate();
        const tableRow = this.parentElement?.parentElement?.parentElement;
        if (!tableRow) {
          showToast('unknown tableRow');
          inButtonOperation.startTimer();
          return;
        }
        const revisionId = tableRow.dataset.revisionId;
        if (revisionId === undefined) {
          showToast('unknown revision');
          inButtonOperation.startTimer();
          return;
        }
        urlsearch.set('revisionId', revisionId);
        const json = tableRow.dataset.cache ? JSON.parse(tableRow.dataset.cache) :
          await (await fetch('/api/wikipageContent?' + urlsearch.toString())).json(),
          node = template.content.cloneNode(true), div = document.createElement('div');
        div.append(node); div.innerHTML += json.contentHTML;
        div.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', function (event) {
            event.preventDefault();
            navigateTo(a.dataset.href as string);
          }, { signal });
          attachAnchors(wikipageName, a);
        }); tableRow.dataset.cache = JSON.stringify(json);
        templateVision.replaceChildren(div);
        inButtonOperation.startTimer();
      }, { signal });
      buttons.append(
        Object.assign(button, { textContent: 'View Content', type: 'button' }), space,
        Object.assign(viewContentSource, { textContent: 'View Content Source', type: 'button' }),
      ); viewContentSource.addEventListener('click', async function () {
        inButtonOperation.activate();
        const tableRow = this.parentElement?.parentElement?.parentElement;
        if (!tableRow) {
          showToast('unknown tableRow');
          inButtonOperation.startTimer();
          return;
        }
        const revisionId = tableRow.dataset.revisionId;
        if (revisionId === undefined) {
          showToast('unknown revision');
          inButtonOperation.startTimer();
          return;
        }
        urlsearch.set('revisionId', revisionId);
        const json = tableRow.dataset.cache ? JSON.parse(tableRow.dataset.cache) :
          await (await fetch('/api/wikipageContent?' + urlsearch.toString())).json();
        tableRow.dataset.cache = JSON.stringify(json);
        noteBody.value = json.content;
        showToast({ 'appearance': 'success', text: 'loaded Revision successfully' });
        inButtonOperation.startTimer();
      });
    }

    addErrorMessage(true,
      `Fetched Revision History of '${wikipageName}'`,
      `Fetched Revision History of '${wikipageName}'`);
    inLoadingOperation.startTimer();
  }, onRejected => onRejected.then((json: any) => {
    addErrorMessage(false, jsonEncode(json, 2),
      `Fetched Revision History of '${wikipageName}'`);
    inLoadingOperation.startTimer();
  }),
  );
}

function datetimeBugFix(bugged: string): Date {
  return new Date(Date.parse(bugged) * 1000);
}
