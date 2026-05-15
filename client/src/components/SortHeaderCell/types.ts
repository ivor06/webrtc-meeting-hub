import {SORT_DIR} from "../../../../common/interfaces/baseTypes";

export {
    SortHeaderCellProps
}

interface SortHeaderCellProps {
    text: string;
    sortDir?: SORT_DIR;
    onClick?: (event?: any) => void;
    classes?: string;
}
