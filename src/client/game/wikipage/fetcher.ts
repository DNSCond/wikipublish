// exported
export function getWikipageData(wikipageName: string): Promise<{
  content: string, revisionDate: Date, revisionAuthorname: string,
  revisionReason: string, contentHTML: string,
}> {
  return Promise.resolve(fetch('/api/wikipageContent?' + (new URLSearchParams({ wikipageName }).toString()))).then(function (response) {
    const jsonic = response.json();
    if (response.ok) return jsonic;
    else throw jsonic;
  }).then(function (successResp) {
    successResp.revisionDate = new Date(successResp.revisionDate);
    return successResp;
  }, err => err.then(console.error, console.error));
}
