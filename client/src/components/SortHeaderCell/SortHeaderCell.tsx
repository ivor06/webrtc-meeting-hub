import * as React from "react";
import {Cell} from "fixed-data-table";

import {SortHeaderCellProps} from './types';
import {SORT_DIR} from '../../../../common/interfaces/baseTypes';
import {isNumber} from "../../../../common/util";

const SortHeaderCell = ({text, sortDir, onClick, classes}: SortHeaderCellProps): JSX.Element => (
    <Cell className={classes ? classes : ""} {...this.props}>
        <a onClick={onClick} className="cursor-pointer color-black">
            {text} {isNumber(sortDir) ? (sortDir === SORT_DIR.DESC ? '↓' : '↑') : ''}
        </a>
    </Cell>
);

export default SortHeaderCell;
