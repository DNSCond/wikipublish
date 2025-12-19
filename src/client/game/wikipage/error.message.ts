import { FakeFileDirectory, FakeFileFile } from "../FakeFile";

const errormessage_Reddcond = document.querySelector('#errormessage-Reddcond')! as FakeFileDirectory;
{
  const error = addErrorMessage(true, `Errors and Successes will be logged here, but only for this session.`);
  error.backgroundColor = '#ffd2d2';
  error.fileName = 'Infomation';
}

export function addErrorMessage(success: boolean, message: string | Error, fileName: string = ''): FakeFileFile {
  const error = new FakeFileFile, pre = document.createElement('pre'); // @ts-expect-error
  error.fileName = (success ? 'Success' : (message?.name ?? 'Error')) + (fileName ? ` ${fileName}` : '');
  error.append(pre); pre.innerText = `${message}`;
  errormessage_Reddcond.isexpanded = true;
  errormessage_Reddcond.prepend(error);
  return error;
}

export function initializeErrorMessage(success: boolean, message: string | Error, fileName: string = ''): FakeFileFile {
  const error = new FakeFileFile, pre = document.createElement('pre'); // @ts-expect-error
  error.fileName = (success ? 'Success' : (message?.name ?? 'Error')) + (fileName ? ` ${fileName}` : '');
  error.append(pre); pre.innerText = `${message}`;
  errormessage_Reddcond.isexpanded = true;
  error.open = true;
  return error;
}

export function addAggregateErrorMessage(name: string, errors: FakeFileFile[]): FakeFileDirectory {
  const error = new FakeFileDirectory;
  error.fileName = 'Aggregated Results ' + name;
  error.append(...errors); error.isexpanded = true;
  errormessage_Reddcond.isexpanded = true;
  errormessage_Reddcond.prepend(error);
  return error;
}
