import {UserInterface} from "../../../../common/interfaces/User";

export {
    UserSearchItemProps
}

interface UserSearchItemProps {
    user: UserInterface;
    onClick: () => void;
}
