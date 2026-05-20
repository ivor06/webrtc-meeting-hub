export {
    joinUrl
}

function joinUrl(...parts: string[]): string {
    return parts
        .filter(part => part !== null && part !== undefined && part !== "")
        .map((part, index) => index === 0 ? part.replace(/\/+$/g, "") : part.replace(/^\/+|\/+$/g, ""))
        .join("/");
}
