import { showToast } from "@devvit/web/client";
import { chunkArray, enumerate } from "./helpers";
import { FakeFileFile } from "./FakeFile";
import { addAggregateErrorMessage, addErrorMessage, initializeErrorMessage } from "./wikipage/error.message";

let uploadable = true;
const imageHandler = document.getElementById('imageUpload')! as HTMLInputElement,
  imageUploadOutput = document.getElementById('imageUpload-output')! as HTMLOutputElement;
document.getElementById("createLinkforImage")!.addEventListener('click', async function () {
  if (!uploadable) { showToast('please wait'); return; }
  uploadable = false; const file = imageHandler.files?.[0];
  if (file) {
    const tokenId = Date.now(), dataUrl = await blobject.btoa(file), promise =
      Array.from(enumerate(chunkArray(Array.from(dataUrl), 100_000)), ({ element }) => element.join('')).map((element, index) =>
        fetch(`/api/createPartialURL?cache-buster=${index}-${tokenId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({ element, tokenId, index }),
        })
      );
    await Promise.all(promise).then(resolved => {
      const errors: FakeFileFile[] = [],
        promiseArray = resolved.map((resp, index) =>
          resp.json().then(jsonic => {
            if (!resp.ok) {
              errors.push(initializeErrorMessage(false, jsonic.message, 'partialImageError ' + index));
              return false;
            } else return true;
          }, (error: any) => {
            errors.push(initializeErrorMessage(false, error.message, 'partialImageError ' + index));
            return false;
          }));
      return Promise.all(promiseArray).then(allOk => {
        if (!allOk) {
          addAggregateErrorMessage('partialImageError', errors);
          throw allOk;
        }
      });
    });

    const response = await fetch('/api/createImageURL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId }),
    }), json = await response.json();
    if (response.ok) {
      imageUploadOutput.textContent = json.mediaUrl;
      showToast({ text: json.message, appearance: 'success' });
      addErrorMessage(true, json.message, 'successFully created the image');
    } else {
      imageUploadOutput.textContent = 'Error';
      showToast(json.message);
      addErrorMessage(false, json.message, 'failed to create the image');
      console.error(json.message);
    }
  }
  uploadable = true;
});

const blobject = {
  btoa(blob: Blob): Promise<string> {
    const fr = new FileReader(), once = true;
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    const abortController = new AbortController;
    const { signal } = abortController;
    if (!(blob instanceof Blob)) {
      reject(new TypeError);
      return promise;
    }
    fr.addEventListener("load", function () {
      abortController.abort();
      // @ts-expect-error
      resolve(fr.result);
    }, { once, signal });
    fr.addEventListener("error", function () {
      abortController.abort();
      reject(fr.error);
    }, { once, signal });
    fr.readAsDataURL(blob);
    return promise;
  },
};

