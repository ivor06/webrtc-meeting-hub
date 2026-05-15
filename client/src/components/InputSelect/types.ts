import {SelectOption} from "../../../../common/interfaces/baseTypes";
export {
    InputSelectProps
}

interface InputSelectProps {
    name: string;
    label: string;
    value?: any;
    defaultOption?: SelectOption;
    options?: SelectOption[];
    error?: string;
    onChange: () => void;
}
