import * as React from "react";

import {InputCamera, InputText, InputNumber, InputSelect, InputCheckBox} from '../index';
import {UserFormProps} from './types';

const UserForm = ({
                      user, fields, errors, isValid, isSaving, onChange, onScreenShot, onBlur, onSave, onAddStream,
                      orgKindList, defaultKindOption, countryList, defaultCountryOption, provinceList,
                      defaultProvinceOption, cityList, defaultCityOption, cameraLocationList,
                      defaultCameraLocationOption, orgAgeRestrictionList, defaultAgeRestrictionOption
                  }: UserFormProps): JSX.Element => (
    <div className="user-form padding-top-navbar">
        <h1 className="text-center">New user</h1>
        <div className="row">
            <div className="col-md-2"/>
            <div className="col-md-8 well">
                <form>
                    <h3 className="text-center">User</h3>
                    <fieldset className="panel panel-body">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isValid || isSaving}
                            onClick={onSave}>{isSaving ? "Saving..." : "Save"}</button>
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
                        <InputText
                            name={fields.localFirstName}
                            label="First name*"
                            value={user.local.firstName}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.localFirstName]}/>
                        <InputText
                            name={fields.localLastName}
                            label="Last name*"
                            value={user.local.lastName}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.localLastName]}/>
                    </fieldset>
                    <h3 className="text-center">Organization</h3>
                    <fieldset className="panel panel-body">
                        <InputText
                            name={fields.orgName}
                            label="Name*"
                            value={user.org.name}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgName]}/>
                        <InputSelect
                            name={fields.orgKind}
                            label="Kind"
                            value={user.org.kind ? user.org.kind : orgKindList[0].value}
                            defaultOption={defaultKindOption || orgKindList[0]}
                            options={orgKindList}
                            onChange={onChange}
                            error={errors[fields.orgKind]}/>
                        <InputSelect
                            name={fields.orgCountryISO}
                            label="Country"
                            value={user.org.countryISO ? user.org.countryISO : defaultCountryOption.value}
                            defaultOption={defaultCountryOption}
                            options={countryList}
                            onChange={onChange}
                            error={errors[fields.orgCountryISO]}/>
                        {provinceList && provinceList.length > 0 && <InputSelect
                            name={fields.orgProvinceISO}
                            label="Province/State"
                            value={user.org.provinceISO ? user.org.provinceISO : provinceList[0].value}
                            defaultOption={defaultProvinceOption ? defaultProvinceOption : provinceList[0]}
                            options={provinceList}
                            onChange={onChange}
                            error={errors[fields.orgProvinceISO]}/>}
                        {cityList && cityList.length > 0 && <InputSelect
                            name={fields.orgCityId}
                            label="City"
                            value={user.org.cityId ? user.org.cityId : cityList[0].value}
                            defaultOption={defaultCityOption ? defaultCityOption : cityList[0]}
                            options={cityList}
                            onChange={onChange}
                            error={errors[fields.orgCityId]}/>}
                        <InputText
                            name={fields.orgAddress}
                            label="Address*"
                            value={user.org.address}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgAddress]}/>
                        <InputText
                            name={fields.orgZip}
                            label="Zip code*"
                            value={user.org.zip}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgZip]}/>
                        <InputText
                            name={fields.orgPhone}
                            label="Phone number*"
                            value={user.org.phone}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgPhone] && "Invalid phone number"}/>
                        <InputCheckBox
                            name={fields.orgIsNeedSendPaperInvoice}
                            label="Send invoices by post"
                            checked={user.org.isNeedSendPaperInvoice}
                            onChange={onChange}
                            error={errors[fields.orgIsNeedSendPaperInvoice]}/>
                        <InputNumber
                            name={fields.orgSeatAmount}
                            label="Seat amount"
                            value={user.org.seatAmount}
                            min={0}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgSeatAmount]}/>
                        <InputNumber
                            name={fields.orgOperatingTimeOpen}
                            label="Opening at"
                            value={user.org.operatingTimeOpen}
                            min={0}
                            max={24}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgOperatingTimeOpen]}/>
                        <InputNumber
                            name={fields.orgOperatingTimeClose}
                            label="Closing at"
                            value={user.org.operatingTimeClose}
                            min={0}
                            max={24}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors[fields.orgOperatingTimeClose]}/>
                        <InputSelect
                            name={fields.orgAgeRestriction}
                            label="Age restriction"
                            value={user.org.ageRestriction ? user.org.ageRestriction : orgAgeRestrictionList[0].value}
                            defaultOption={defaultAgeRestrictionOption || orgAgeRestrictionList[0]}
                            options={orgAgeRestrictionList}
                            onChange={onChange}
                            error={errors[fields.orgAgeRestriction]}/>
                        <InputCamera
                            name={fields.orgCamera}
                            label="Public camera"
                            value={user.org.camera}
                            cameraLocationList={cameraLocationList}
                            defaultCameraLocationOption={defaultCameraLocationOption}
                            fields={fields}
                            onChange={onChange}
                            onScreenShot={onScreenShot}
                            onBlur={onBlur}
                            onAddStream={onAddStream}
                            errors={errors}
                            error={errors[fields.orgCamera]}/>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>
);

export default UserForm;
