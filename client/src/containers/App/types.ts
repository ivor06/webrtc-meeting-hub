import {UserInterface} from "../../../../common/interfaces/User";

export {
    AppProps,
    AppState
}

interface AppProps {
    user: UserInterface;
    isLogged: boolean;
    actions: {
        loginToken: () => Promise<any>;
        logout: () => Promise<null>;
    };
}

interface AppState {
}
