export {
    InputDateProps
}

interface InputDateProps {
    name: string;
    label: string;
    value?: any;
    error: string;
    onChange: () => void;
}
