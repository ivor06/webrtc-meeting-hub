import * as React from "react";

import {InputCameraProps} from "./types";
import {InputCheckBox, InputSelect} from "../index";

const InputCamera = ({name, label, value, fields, cameraLocationList, defaultCameraLocationOption, error, onChange, onBlur}: InputCameraProps) =>
    <div className="form-group">
        <div className="form-group padding-top-20px">
            <h4 htmlFor={name}>{label}</h4>
            <fieldset name={name}>
                <InputCheckBox
                    name={fields.orgCameraHasSound}
                    label="Camera has sound"
                    checked={value.hasSound}
                    onChange={onChange}/>
                <InputSelect
                    name={fields.orgCameraLocation}
                    label="Location"
                    value={value.location ? value.location : 0}
                    defaultOption={defaultCameraLocationOption || cameraLocationList[0]}
                    options={cameraLocationList}
                    onChange={onChange}/>
            </fieldset>
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    </div>;

export default InputCamera;
