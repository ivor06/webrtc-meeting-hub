export {
    InputTextProps
}

interface InputTextProps {
    name: string;
    type?: string;
    value?: string;
    placeholder?: string;
    label?: string;
    error: string;
    onChange: () => void;
    onBlur?: () => void;
}
