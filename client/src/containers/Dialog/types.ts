export {
    DialogProps,
    DialogState,
    DialogContent
}

interface DialogContent {
    header?: string;
    text?: string;
    image?: string;
    buttonList?: DialogButton[];
    isClosable?: boolean;
    closeOnClick?: boolean;
    isError?: boolean;
    connectionStatus?: string;
    callBack?: (result?: any) => void;
}

interface DialogButton {
    label?: string;
    action?: string;
    callBack?: (result?: any) => void;
    className?: string;
    iconClassName?: string;
}

interface DialogProps {
    content?: DialogContent;
}

interface DialogState {
    content?: DialogContent;
    isDisplay?: boolean;
    isAnimation?: boolean;
}
