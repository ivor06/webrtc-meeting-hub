import * as React from "react";

import {InputCheckBoxProps} from "./types";

const InputCheckBox = ({name, label, checked, error, onChange}: InputCheckBoxProps) => <div className="form-group">
    <div className="form-check field display-inline">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="form-check-input inline-20px">
        </input>
        <label className="form-check-label" htmlFor={name}>{label}</label>
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
</div>;

export default InputCheckBox;
