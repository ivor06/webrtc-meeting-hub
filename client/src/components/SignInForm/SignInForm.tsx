import * as React from "react";

import {InputText} from '../index';
import {SignInFormProps} from './types';

const SignInForm = ({user, fields, errors, isValid, isSaving, onChange, onBlur, onLogin}: SignInFormProps): JSX.Element => (
    <div className="user-form padding-top-navbar">
        <h1 className="text-center">New user</h1>
        <div className="row">
            <div className="col-md-2"/>
            <div className="col-md-8 well">
                <form>
                    <h3 className="text-center">User</h3>
                    <fieldset className="panel panel-body">
                        <InputText
                            name={fields.localEmail}
                            type="email"
                            label="Email*"
                            value={user.local.email}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.localEmail] && "Invalid email"}/>
                        <InputText
                            name={fields.localPassword}
                            type="password"
                            label="Password*"
                            value={user.local.password}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.localPassword]}/>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isValid || isSaving}
                            onClick={onLogin}>{isSaving ? "Signing in..." : "Sign In"}</button>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>
);

export default SignInForm;
