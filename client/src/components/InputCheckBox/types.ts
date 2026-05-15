export {
    InputCheckBoxProps
}

interface InputCheckBoxProps {
    name: string;
    label: string;
    checked?: boolean;
    error?: string;
    onChange: () => void;
}
