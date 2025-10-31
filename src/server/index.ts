import express from "express";
import {
  createServer,
  context,
  getServerPort,
  reddit,
} from "@devvit/web/server";
import { createPost } from "./post";

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
    await isModerayor();
    const pages = (await reddit.getWikiPages(context.subredditName)).filter(wikipageName => !wikipageName.startsWith('config/'));
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
    const { content } = (await reddit.getWikiPage(context.subredditName, wikipageName));
    res.json({ content });
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
  if (!user) throw new TypeError('currentUser is undefined');
  const username = user.username;
  const isMod = !!(await user.getModPermissionsForSubreddit(context.subredditName)).length;
  if (!isMod) throw new RangeError('CurrentUser isnt a mod');
  return { user, username };
}

router.get("/api/currentSubredditName", async (_req, res): Promise<void> => {
  res.status(200).json({ status: "success", currentSubredditName: context.subredditName, });
});
app.post('/api/wikipost', async (req, res) => {
  const { text, wikipageName } = JSON.parse(req.body), { subredditName } = context;
  try {
    const { username } = await isModerayor();
    const reason = `revision by u/${username} (${Date()})`;

    if (typeof wikipageName !== 'string') throw new TypeError('wikipageName msut be a string');
    if (wikipageName.startsWith('config/')) throw new TypeError('(config/) pages cant be edited');
    const content = text + '\n\n' + reason, page = wikipageName;
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
  const navigateTo = await createPost();

  res.json({ navigateTo });
});


app.use(router);
const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
