import * as React from "react";

import {InputFileProps} from "./types";

const InputFile = ({name, type, value, label, onChange}: InputFileProps) => <div className="form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <div className="field">
        <input
            id="input-file"
            type="file"
            name={name}
            className="form-control"
            value={value}
            onChange={onChange}/>
    </div>
</div>;

export default InputFile;
