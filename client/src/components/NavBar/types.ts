export {
    NavBarProps,
    Navlink
}

interface Navlink { url: string; text: string;
}
interface NavBarProps {
    logoText: string;
    links?: Navlink[];
    userName?: string;
    userPhoto?: string;
    isLogged?: boolean;
    onLogout?: () => void;
    onClick?: () => void;
}
