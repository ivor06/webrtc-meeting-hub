import * as React from "react";

import {SortHeaderCellProps} from './types';
import {SORT_DIR} from '../../../../common/interfaces/baseTypes';
import {isNumber} from "../../../../common/util";

const SortHeaderCell = ({text, sortDir, onClick, classes}: SortHeaderCellProps): React.ReactElement => (
    <div className={classes ? classes : ""}>
        <a onClick={onClick} className="cursor-pointer color-black">
            {text} {isNumber(sortDir) ? (sortDir === SORT_DIR.DESC ? '↓' : '↑') : ''}
        </a>
    </div>
);

export default SortHeaderCell;
