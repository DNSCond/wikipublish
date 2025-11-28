# Time URLs

Time URLs are my way to conviently use reddit syntax to its advantage by replacing urls to
`clock.ant.ractoc.com` with a [HTMLTimeElement](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time),
that domain is however, never called in the devvit app, its sole purpose is to be recognized.

## how to format a Time URL?

first use the domain `clock.ant.ractoc.com` in redit markdown, WikiPublish will only recognize it if reddit's link markdown recognizes it.
if it appears as plaintext it wont work.

after `https://clock.ant.ractoc.com/?t=` append a Datetime, in all cases use [the format described in Date.prototype.toISOString\(\)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString).

thats pretty much it!

[to use custom formats use PHP formats described here](https://www.php.net/manual/en/datetime.format.php#refsect1-datetime.format-parameters)
url encode them and pass them in the query param called `format-custom`. (not all might be supported well, nowever most should)

there are also default formats. for now, view the source code of this devvit app and this repository https://github.com/DNSCond/Datetime-local

to use a relative time from now use `&type=relative`.
