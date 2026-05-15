import {HashString} from "../../../../common/interfaces/baseTypes";
import {UserInterface} from "../../../../common/interfaces/User";

export {
    SignInFormProps
}

interface SignInFormProps {
    user?: UserInterface;
    fields?: HashString;
    errors?: HashString;
    isValid?: boolean;
    isSaving?: boolean;
    onChange?: (event?) => void;
    onBlur?: (event?) => void;
    onLogin?: (event?: any) => any;
}
