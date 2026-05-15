import {UserInterface} from "../../../../common/interfaces/User";
export {
    ManageVideoProps,
    ManageVideoState
}

interface ManageVideoProps {
    userList?: UserInterface[];
    user?: UserInterface;
    getOrgNameById?: (id: string, userList: UserInterface[]) => string;
    getUserScreenshotById?: (id: string, userList: UserInterface[]) => string;
}

interface ManageVideoState {
    userId?: string;
    isDisplay?: boolean;
    isAnimation?: boolean;
    isTestMode?: boolean;
    hasCallRejected?: boolean;
    isCalling?: boolean;
    isTesting?: boolean;
    isRemoteCallRequest?: boolean;
    remoteUserId?: string;
    userList?: UserInterface[];
    header?: string;
}
