export default async (ctx, next) => {
    if (!ctx.request.url.endsWith(".js") && !ctx.request.url.endsWith(".woff2") && !ctx.request.url.endsWith(".ico"))
        console.log("request:", ctx.request.url, Date.now());
    await next();
};
