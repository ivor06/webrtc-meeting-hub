import * as React from "react";

import {InputTextProps} from "./types";

const InputText = ({name, type, value, placeholder, label, error, onChange, onBlur}: InputTextProps) => <div className="form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <div className="field">
        <input
            type={type || "text"}
            name={name}
            className="form-control"
            placeholder={placeholder}
            value={value || ""}
            onBlur={onBlur}
            onChange={onChange}/>
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
</div>;

export default InputText;
