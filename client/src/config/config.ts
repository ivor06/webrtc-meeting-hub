const
    IS_PRODUCTION = false,
    API_URL = IS_PRODUCTION ? "https://my-host.com:443" : "https://localhost:443",
    SOCKET_IO_URL = IS_PRODUCTION ? "https://my-host.com:443" : "https://localhost:443",
    PATH_IMAGES = API_URL + "/assets/images/",
    MAIL_TO = "admin@my-host.com",
    BROWSER = {
        isFirefox: /firefox/i.test(navigator.userAgent),
        isChrome: /chrom(e|ium)/i.test(navigator.userAgent),
        isOpera: /OPR/i.test(navigator.userAgent),
        version: null
    },
    DEFAULT_LANGUAGE = "en",
    DEFAULT_COUNTRY_ISO = "US";

if (BROWSER.isFirefox)
    BROWSER.version = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);

else if (BROWSER.isOpera) {
    const versionParseResult = navigator.userAgent.match(/OPR\/([0-9]+)\./);
    BROWSER.version = versionParseResult && versionParseResult[1] && parseInt(versionParseResult[1], 10) || null;
}

else if (BROWSER.isChrome) {
    const versionParseResult = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    BROWSER.version = parseInt(versionParseResult[2], 10) || null;
}

else
    BROWSER.version = null;

export {
    IS_PRODUCTION,
    API_URL,
    PATH_IMAGES,
    BROWSER,
    SOCKET_IO_URL,
    MAIL_TO,
    DEFAULT_LANGUAGE,
    DEFAULT_COUNTRY_ISO
}
