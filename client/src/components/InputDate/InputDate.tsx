import * as React from "react";

import {InputDateProps} from "./types";

const InputSelect = ({name, label, value, error, onChange}: InputDateProps) => <div className="form-group">
    <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <div className="field">
            <input
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                className="form-control">
            </input>
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    </div>
</div>;

export default InputSelect;
