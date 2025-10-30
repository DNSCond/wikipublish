import { context, reddit } from "@devvit/web/server";

export async function createPost(title: string | undefined = undefined, appDisplayName = 'wikipublish', buttonLabel = 'Enter', description = 'wikiedit or wikipublish') {
    const { subredditName } = context;
    if (!subredditName) {
        throw new Error("subredditName is required");
    }
    return reddit.submitCustomPost({
        splash: { // Splash Screen Configuration
            appDisplayName,
            backgroundUri: 'default-splash.png',
            buttonLabel,
            description,
            // @ts-expect-error
            entryUri: 'index.html',
            heading: 'heading',
            appIconUri: 'default-icon.png',
        },
        postData: {},
        subredditName,
        title: title ?? Date(),
    });
};
