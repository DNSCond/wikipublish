//<!DOCTYPE js>
export function findall(regex: RegExp, string: string): RegExpMatchArray | [] {
    return string.match(regex) ?? [];
}

export function htmldecode(String_: string): string {
    return (String_ + []).replace(/&#38;/g, '&').replace(/&#39;/g, '\'').replace(/&#34;/g, '\"').replace(/&#60;/g, '<').replace(/&#62;/g, '>');
}

export function htmlencode(String_: string): string {
    return (String_ + []).replace(/&/g, '&#38;').replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/</g, '&#60;').replace(/>/g, '&#62;');
}
