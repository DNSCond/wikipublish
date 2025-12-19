import { navigateTo } from "@devvit/web/client";
import { jsonEncode } from "anthelpers";
import { Datetime_global, Datetime_global_constructor } from "datetime_global/Datetime_global";
import { ClockTime, RelativeTime } from "datetime_global/RelativeTimeChecker";
import { getISOWeek } from "../../isoWeek";
import { replaceAnchorWith } from "../attachNavigateToAchorTag";
import { createDetailsElementWith } from "../details";
import { FakeFileFile } from "../FakeFile";
import { getWikipageData } from "./fetcher";
import { onButtonClick } from "../helpers";
import { addErrorMessage } from "./error.message";
import { noteBody, noteTitle } from "../game";

const wikipageListAbort: AbortController[] = [];

export function wikipageListAbort_abort(thing?: any) {
  wikipageListAbort.forEach(aborter => aborter.abort(thing));
}

export const container = document.getElementById("wikipageList")!;

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
      style += 'ul{padding-left:2ch;}div.tablediv{overflow:scroll;}</style><style class="reddit table">table{'
        + `border-collapse:collapse; background-color:white;min-width: 100%;}td,th{border:1px solid #dddddd`
        + `; text-align:left; padding:8px;} tr:nth-child(even) {background-color:#dddddd;}</style>`;
      const html = document.createElement('div'); html.setAttribute('style', '/*overflow:scroll;*/');
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
        const { signal } = myAborter;
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
                  replacement.setAttribute('data-href', url); if ('timezone' in replacement)
                    replacement.timezone = Datetime_global.hostLocalTimezone();
                  a.replaceChildren(replacement);
                } return;
              }
            }
          }
          a.dataset.wikipageName = wikipageName;
        });

        Array.from(html.shadowRoot!.querySelectorAll('table'), table => insertBetween(table, 'div', ['tablediv']));
      }
    }
  }
}

export function insertBetween<RETURN extends Element = HTMLDivElement>(html: HTMLElement, containerTagName: string = 'div', classNames: string[] = []): RETURN {
  const div: RETURN = document.createElement(containerTagName) as unknown as RETURN; html.replaceWith(div);
  div.className = 'insertedDiv ' + classNames.join('\x20'); div.append(html); return div;
}


function countUTF8Bytes(str: string): number {
  return (new TextEncoder).encode(str).length;
}
