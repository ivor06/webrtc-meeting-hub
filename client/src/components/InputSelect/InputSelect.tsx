import * as React from "react";

import {InputSelectProps} from "./types";

const InputSelect = ({name, label, value, defaultOption, options, error, onChange}: InputSelectProps) => <div className="form-group">
    <div className="form-group">
        <label htmlFor={name}>{label}</label>
        <div className="field">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="form-control">
                <option key={defaultOption.value} value={defaultOption.value}>{defaultOption.text}</option>
                {options.filter(option => option.text !== defaultOption.text).map(option =>
                    <option key={option.value} value={option.value}>{option.text}</option>)}
            </select>
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    </div>
</div>;

export default InputSelect;
