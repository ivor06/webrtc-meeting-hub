const expect = require("expect");

const pubsubService = require("./pubsub.service.ts");

describe("Testing pubsub.service.ts", () => {
    it("registerEvent/hasEvent/subscribeOn/publishEvent/unSubscribeAll", () => {

        const
            eventName = "myEvent",
            arg1 = 1,
            arg2 = {b: 2};

        pubsubService.registerEvent(eventName);

        expect(true).toEqual(pubsubService.hasEvent(eventName));
        expect(false).toEqual(pubsubService.hasEvent("NotExistingEventName"));

        pubsubService.subscribeOn(eventName, (data1, data2) => {
            expect(data1 ? arg1 : undefined).toEqual(data1);
            expect(data2 ? arg2 : undefined).toEqual(data2);
        });

        pubsubService.publishEvent(eventName);
        pubsubService.publishEvent(eventName, arg1);
        pubsubService.publishEvent(eventName, arg1, arg2);

        pubsubService.unSubscribeAll(eventName);

        expect(false).toEqual(pubsubService.hasEvent(eventName));
    });
});
