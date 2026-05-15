export {
    InputNumberProps
}

interface InputNumberProps {
    name: string;
    type?: string;
    value?: number;
    min?: number;
    max?: number;
    label?: string;
    error: string;
    onChange: () => void;
    onBlur?: () => void;
}
