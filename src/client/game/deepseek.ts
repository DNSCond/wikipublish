import { initializeWikipage, wikipageListAbort_abort } from "./game";

// createWikipagesStructure
export function createWikipagesStructure(strings: string[]): DocumentFragment {
    const fragment = document.createDocumentFragment();
    wikipageListAbort_abort();

    // Separate strings with and without slashes
    const noSlashStrings: string[] = [];
    const slashStrings: string[] = [];

    strings.forEach(str => {
        if (str.includes('/')) {
            slashStrings.push(str);
        } else {
            noSlashStrings.push(str);
        }
    });

    // Sort alphabetically
    noSlashStrings.sort();
    slashStrings.sort();

    // Process strings without slashes
    noSlashStrings.forEach(str => {
        const ffF = document.createElement('ff-f');
        ffF.setAttribute('ff-name', str);
        ffF.setAttribute('data-wikipage-name', str);
        initializeWikipage(ffF);
        fragment.appendChild(ffF);
    });

    // Process strings with slashes
    const folderMap = new Map<string, string[]>();

    // Group by first folder level
    slashStrings.forEach(str => {
        const parts = str.split('/');
        const firstFolder = parts[0];
        const remainingPath = parts.slice(1).join('/');

        if (!folderMap.has(firstFolder)) {
            folderMap.set(firstFolder, []);
        }
        folderMap.get(firstFolder)!.push(remainingPath);
    });

    // Create folder structure recursively
    folderMap.forEach((subPaths, folderName) => {
        const folderElement = createFolderStructure(folderName, folderName, subPaths);
        fragment.appendChild(folderElement);
    });

    return fragment;
}

function createFolderStructure(currentName: string, fullPath: string, paths: string[]): HTMLElement {
    const ffD = document.createElement('ff-d');
    ffD.setAttribute('ff-name', currentName);
    ffD.setAttribute('data-wikipage-name', fullPath);

    const noSlashPaths: string[] = [];
    const slashPaths: string[] = [];

    paths.forEach(path => {
        if (path.includes('/')) {
            slashPaths.push(path);
        } else {
            noSlashPaths.push(path);
        }
    });

    // Sort alphabetically
    noSlashPaths.sort();
    slashPaths.sort();

    // Process files in current folder
    noSlashPaths.forEach(path => {
        const ffF = document.createElement('ff-f');
        const fullPageName = `${fullPath}/${path}`;
        ffF.setAttribute('ff-name', path);
        ffF.setAttribute('data-wikipage-name', fullPageName);
        initializeWikipage(ffF);
        ffD.appendChild(ffF);
    });

    // Process subfolders
    const subfolderMap = new Map<string, string[]>();

    slashPaths.forEach(path => {
        const parts = path.split('/');
        const subfolderName = parts[0];
        const remainingPath = parts.slice(1).join('/');
        const subfolderFullPath = `${fullPath}/${subfolderName}`;

        if (!subfolderMap.has(subfolderName)) {
            subfolderMap.set(subfolderName, []);
        }
        subfolderMap.get(subfolderName)!.push(remainingPath);
    });

    // Create subfolder structure recursively
    subfolderMap.forEach((subPaths, subfolderName) => {
        const subfolderFullPath = `${fullPath}/${subfolderName}`;
        const subfolderElement = createFolderStructure(subfolderName, subfolderFullPath, subPaths);
        ffD.appendChild(subfolderElement);
    });

    return ffD;
}
