import * as React from "react";

import {InputNumberProps} from "./types";

const InputNumber = ({name, type, value, min, max, label, error, onChange, onBlur}: InputNumberProps) => <div className="form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <div className="field">
        <input
            type={type || "number"}
            name={name}
            className="form-control"
            min={min}
            max={max}
            value={value || undefined}
            onBlur={onBlur}
            onChange={onChange}/>
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
</div>;

export default InputNumber;
