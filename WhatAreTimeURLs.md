# Time URLs

Time URLs conveniently allow you to convert a standard **Reddit Markdown** link into an **interactive date and time element** (an [HTMLTimeElement](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time)). This element will automatically display the time in the viewer's **local timezone**.

The Devvit app recognizes the domain `clock.ant.ractoc.com` purely as a signal for conversion; this domain is **never** actually called by the application.

---

## How to Format a Time URL

To create a Time URL, you must use **Reddit's standard link markdown syntax** so the Devvit app can properly recognize it. If the URL appears as plain text, it will not work.

### Step 1: Base Link Structure

Start with the base URL:
`https://clock.ant.ractoc.com/?t=`

### Step 2: Append the Datetime (Required)

Append your desired Datetime to the URL. In all cases, you **must** use the **ISO 8601 format**, which is precisely described by [Date.prototype.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString).

in quick words `YYYY-MM-DDTHH:MM:SSZ` in the UTC Timezone. for example `2018-01-03T15:18:11Z`

**Example of a complete Time URL:**
`[My Event Time](https://clock.ant.ractoc.com/?t=2024-10-27T10:00:00.000Z)`

---

## Advanced Usage & Options

### Relative Time

To show a time relative to now (e.g., "5 hours ago" or "in 2 days"), append the parameter `&type=relative`.

### Custom Formats

You can use custom display formats by passing a URL-encoded string in the query parameter called `format-custom`.

* The formats are based on [**PHP's date formats**, which are described here](https://www.php.net/manual/en/datetime.format.php#refsect1-datetime.format-parameters).
* **Note:** While most PHP formats are supported, not all might work perfectly.

---

For a complete list of default formats and source code, view the source code of this Devvit app and the accompanying repository: https://github.com/DNSCond/Datetime-local
