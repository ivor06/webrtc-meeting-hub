import {MessageInterface} from "../../../../common/interfaces/Message";
import {UserInterface} from "../../../../common/interfaces/User";

export {
    ChatProps,
    ChatState
}

interface ChatProps {
    user: UserInterface;
    remoteUserId: string;
    selfUserId: string;
}

interface ChatState {
    remoteUserId?: string;
    selfUserId?: string;
    messageList?: MessageInterface[];
    currentMessageText?: string;
}
