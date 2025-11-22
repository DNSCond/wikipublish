import { reddit } from "@devvit/web/server";

export const createPost = async (title: string) => await reddit.submitCustomPost({ title });
