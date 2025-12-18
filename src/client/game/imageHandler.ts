import { showToast } from "@devvit/web/client";
import { chunkArray, enumerate } from "./helpers";
import { CustomError } from "anthelpers";

const imageHandler = document.getElementById('imageUpload')! as HTMLInputElement,
  imageUploadOutput = document.getElementById('imageUpload-output')! as HTMLOutputElement;
document.getElementById("createLinkforImage")!.addEventListener('click', async function () {
  const file = imageHandler.files?.[0];
  if (file) {
    const tokenId = Date.now(), dataUrl = await blobject.btoa(file), promise =
      Array.from(enumerate(chunkArray(Array.from(dataUrl), 100_000)), ({ element }) => element.join('')).map((element, index) =>
        fetch(`/api/createPartialURL?cache-buster=${index}-${tokenId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ element, tokenId }),
        })
      );
    await Promise.all(promise).then(resolved =>
      resolved.forEach(resp => {
        if (!resp.ok) {
          throw new CustomError('Response Isnt Ok when Data URL', resp);
        }
      })
    ).catch(catched => {
      showToast(catched.message);
      throw catched;
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
    } else {
      imageUploadOutput.textContent = 'Error';
      showToast(json.message);
      console.error(json.message);
    }
  }
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

