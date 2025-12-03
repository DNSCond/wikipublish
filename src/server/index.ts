import express from "express";
import {
  createServer,
  context,
  getServerPort,
  reddit,
} from "@devvit/web/server";
import { createPost } from "./post";
// import { } from "anthelpers";
import { htmlencode } from "./htmlencode";

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get("/api/wikipageList", async (_req, res): Promise<void> => {
  try {
    // await isModerayor();
    const step = await reddit.getWikiPages(context.subredditName);
    const pages = step;//.filter(wikipageName => !wikipageName.startsWith('config/') && wikipageName !== 'config/automoderator');
    res.json({ pages });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to Fetch",
      error: String(error),
      pages: []
    });
  }
});

router.get("/api/wikipageContent", async (req, res): Promise<void> => {
  try {
    await isModerayor();
    const wikipageName = req.query.wikipageName as string | undefined;
    if (!wikipageName) throw new RangeError('wikipageName is undefined');
    let { content, revisionDate, revisionAuthor, revisionReason, contentHtml } = (await reddit.getWikiPage(context.subredditName, wikipageName));
    content = wikipageName === 'config/automoderator' ? content : content.replace(/\s*(?:---\s*)?revision by.+$/i, '');
    const revisionAuthorname = revisionAuthor?.username || '[undefined]';
    const contentHTML = wikipageName === 'config/automoderator' ? `<pre class=Favicond_antboiy-addition>${htmlencode(content)}</pre>` : contentHtml;
    res.json({ content, revisionDate, revisionAuthorname, revisionReason, contentHTML });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to Fetch",
      error: String(error),
    });
  }
});
async function isModerayor() {
  const user = await reddit.getCurrentUser();
  if (!user) throw new TypeError('CurrentUser is undefined');
  const username = user.username;
  const isMod = !!(await user.getModPermissionsForSubreddit(context.subredditName)).length;
  if (!isMod) throw new RangeError('CurrentUser isnt a mod');
  return { user, username };
}

router.get("/api/currentSubredditName", async (_req, res): Promise<void> => {
  res.status(200).json({ status: "success", currentSubredditName: context.subredditName, });
});

router.get("/api/isModerator", async (_req, res): Promise<void> => {
  try { await isModerayor(); } catch (errorObject) {
    const error = String(errorObject);
    res.status(400).json({ status: "error", isModerator: false, error });
    return;
  }
  res.status(200).json({ status: "success", isModerator: true, error: null });
});

app.post('/api/wikipost', async (req, res) => {
  const { text, wikipageName } = JSON.parse(req.body), { subredditName } = context;
  try {
    const { username } = await isModerayor();
    const reason = `revision by u/${username} (${Date()})`;

    if (typeof wikipageName !== 'string') throw new TypeError('wikipageName msut be a string');
    if (wikipageName.startsWith('config/') && wikipageName !== 'config/automoderator') throw new TypeError('(config/) pages cant be edited');
    const content = text + '\n\n---\n\n' + (wikipageName === 'config/automoderator' ? '# ' : '') + reason, page = wikipageName;
    await reddit.updateWikiPage({ content, subredditName, page, reason, });

    res.status(200).json({
      status: "success",
      message: 'successfully published',
      text, wikipageName,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to create wikipage",
      error: String(error),
    });
    throw error;
  }
});

router.post("/internal/menu/create-post", async (_req, res) => {
  //const { subredditName } = req.body; // Ensure you get the subreddit name from the request context
  //if (!subredditName) {res.status(400).json({ showToast: 'Subreddit name missing.' });return;}
  const navigateTo = await createPost('Please Ignore, The moderators need to edit the wiki');
  await navigateTo.addComment({
    text: 'please ignore this post. it was created due to a nessary workarounddue ' +
      'to devvit\'s limitations. if i can find a way to not make posts then ill do it'
  });
  res.json({ navigateTo });
});

app.use(router);
const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
