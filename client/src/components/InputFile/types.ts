export {
    InputFileProps
}

interface InputFileProps {
    name?: string;
    type?: string;
    value?: string;
    label?: string;
    onChange?: () => void;
}
