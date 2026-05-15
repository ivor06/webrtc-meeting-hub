import {Camera} from "../../../../common/interfaces/User";
import {HashString, SelectOption} from "../../../../common/interfaces/baseTypes";
export {
    InputCameraProps
}

interface InputCameraProps {
    name: string;
    label: string;
    value: Camera;
    fields: HashString;
    cameraLocationList: SelectOption[];
    defaultCameraLocationOption: SelectOption;
    error: string;
    onChange: () => void;
    onBlur: () => void;
}
