import {ProfileLocal, UserInterface} from "../../../../common/interfaces/User";
import {HashString, HashFunction, SelectOption} from "../../../../common/interfaces/baseTypes";
import {Country} from "../../../../common/interfaces/Country";

export {
    ManageUserProps,
    ManageUserState
}

interface ManageUserProps {
    isLogged: boolean;
    user: UserInterface;
    countryList: Country[];
    actions: {
        save: (user: UserInterface, subscriptions?: HashFunction) => Promise<any>;
        login: (profile: ProfileLocal, subscriptions?: HashFunction) => Promise<any>;
    };
}

interface ManageUserState {
    user?: UserInterface;
    currentCountryISO?: string;
    currentProvinceISO?: string;
    provinceOptionList?: SelectOption[];
    cityOptionList?: SelectOption[];
    errors?: HashString;
    isSaving?: boolean;
    isLogin?: boolean;
    isValid?: boolean;
}
