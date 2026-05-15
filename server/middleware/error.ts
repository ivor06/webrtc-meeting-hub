export default async (ctx, next) => {
    try {
        await next();
    } catch (error) {

        ctx.status = error.statusCode || error.status || 500;

        ctx.body = (error instanceof Error) ? error : {
            message: error
        };
    }
};
