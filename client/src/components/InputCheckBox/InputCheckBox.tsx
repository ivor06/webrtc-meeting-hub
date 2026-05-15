import * as React from "react";

import {InputCheckBoxProps} from "./types";

const InputCheckBox = ({name, label, checked, error, onChange}: InputCheckBoxProps) => <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <div className="field display-inline">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="form-control inline-20px">
        </input>
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
</div>;

export default InputCheckBox;
