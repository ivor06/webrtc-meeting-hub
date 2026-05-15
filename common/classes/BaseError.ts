export {BaseError}

class BaseError extends Error {
    title?: string;
    message: string;

    constructor(message, title?: string) {
        super();
        if (title)
            this.title = title;
        this.message = message;
    }

    toString(): string {
        return (this.title ? this.title : "") + (this.message ? ": " + this.message : "");
    }
}
