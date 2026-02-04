import express from "express";
import { isModerayor } from ".";
import { context, reddit } from "@devvit/web/server";

export const revisionRouter = express.Router();
revisionRouter.get("/api/wikipageRevisions", async (req, res): Promise<void> => {
  try {
    await isModerayor();
    const wikipageName = req.query.wikipageName as string | undefined;
    if (!wikipageName) throw new RangeError('wikipageName is undefined');
    const wikipage = await reddit.getWikiPage(context.subredditName, wikipageName),
      wikipageRevisions = await (await wikipage.getRevisions(new Object)).get(50);
    res.json({ wikipageRevisions });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to Fetch",
      error: String(error),
    });
  }
});
