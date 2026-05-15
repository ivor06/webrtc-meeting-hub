import {UserInterface} from "../../../../common/interfaces/User";
import {HashString, SelectOption} from "../../../../common/interfaces/baseTypes";

export {
    UserFormProps
}

interface UserFormProps {
    user?: UserInterface;
    fields?: HashString;
    orgKindList?: SelectOption[];
    defaultKindOption?: SelectOption;
    orgAgeRestrictionList?: SelectOption[];
    defaultAgeRestrictionOption?: SelectOption;

    countryList?: SelectOption[];
    defaultCountryOption?: SelectOption;

    provinceList?: SelectOption[];
    defaultProvinceOption?: SelectOption;

    cityList?: SelectOption[];
    defaultCityOption?: SelectOption;

    cameraLocationList: SelectOption[];
    defaultCameraLocationOption: SelectOption;
    errors?: HashString;
    isValid?: boolean;
    isSaving?: boolean;
    onChange?: (event?) => void;
    onScreenShot?: (event?) => void;
    onBlur?: (event?) => void;
    onAddStream?: (event?) => void;
    onSave?: (event?: any) => any;
}
