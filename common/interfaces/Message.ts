export {
    MessageInterface
}

interface MessageInterface {
    id?: string;
    userIdTo?: string;
    userIdFrom?: string;
    text?: string;
    time?: Date;
    hasReceivedByRecipient?: boolean;
    hasReceivedByServer?: boolean;
}
