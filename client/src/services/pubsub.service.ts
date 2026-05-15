export {
    hasEvent,
    publishEvent,
    registerEvent,
    subscribeOn,
    unSubscribeAll
}

const events = {};

function registerEvent(name: string) {
    if (!events[name])
        events[name] = [];
}

function publishEvent(name: string, ...args): void {
    if (events[name] && events[name].length)
        events[name].forEach(cb => cb.apply(null, args));
}

function subscribeOn(name: string, callback) {
    if (events[name])
        events[name].push(callback);
    else
        events[name] = [callback];
}

function hasEvent(name: string) {
    return !!events[name];
}

function unSubscribeAll(name: string) {
    if (events[name])
        delete events[name];
}
