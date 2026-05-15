import * as React from "react";
import {browserHistory} from "react-router";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {
    ORG_KIND_LIST,
    ORG_KIND_DEFAULT_ID,
    CAMERA_LOCATION_LIST,
    CAMERA_LOCATION_DEFAULT_ID,
    AGE_RESTRICTION_LIST,
    AGE_RESTRICTION_DEFAULT_ID
} from "../../../../common/dictionaries/org.dictionary";
import {actionCreatorMapObject} from "./actions";
import {ManageUserProps, ManageUserState} from "./types";
import {UserForm, SignInForm} from "../../components/index";
import {getObject, setObject, filterObjectKeys} from "../../../../common/util";
import {getCitiesByCountry, getCitiesByCountryAndProvince, getProvincesByCountry} from "../../services/geo.service";
import {notificationError, notificationSuccess} from "../../services/notification.service";
import {registerPartialSchemaList, validateUser, validateLogin, validateFormInput} from "../../services/validation.service";
import {getErrorMessage} from "../../services/error.service";
import {DEFAULT_LANGUAGE, DEFAULT_COUNTRY_ISO} from "../../config/config";
import {SelectOption} from "../../../../common/interfaces/baseTypes";

const
    fields = {
        localEmail: "local.email",
        localPassword: "local.password",
        localFirstName: "local.firstName",
        localLastName: "local.lastName",
        localTaxNumber: "local.taxNumber",
        orgName: "org.name",
        orgKind: "org.kind",
        orgCountryISO: "org.countryISO",
        orgProvinceISO: "org.provinceISO",
        orgCityId: "org.cityId",
        orgAddress: "org.address",
        orgZip: "org.zip",
        orgPhone: "org.phone",
        orgIsNeedSendPaperInvoice: "org.isNeedSendPaperInvoice",
        orgSeatAmount: "org.seatAmount",
        orgOperatingTimeOpen: "org.operatingTimeOpen",
        orgOperatingTimeClose: "org.operatingTimeClose",
        orgCamera: "org.camera",
        orgCameraUrl: "org.camera.url",
        orgCameraHasSound: "org.camera.hasSound",
        orgCameraLocation: "org.camera.location",
        orgAgeRestriction: "org.ageRestriction"
    },

    transformMap = {
        "org.kind": value => parseInt(value) || ORG_KIND_DEFAULT_ID,
        "org.seatAmount": value => parseInt(value) || null,
        "org.operatingTimeOpen": value => parseInt(value) || null,
        "org.operatingTimeClose": value => parseInt(value) || null,
        "org.camera.location": value => parseInt(value) || CAMERA_LOCATION_DEFAULT_ID,
        "org.ageRestriction": value => parseInt(value) || AGE_RESTRICTION_DEFAULT_ID,
        "org.isNeedSendPaperInvoice": value => value === "true"
    },

    ORG_KIND_LIST_FOR_SELECT = ORG_KIND_LIST.map((kind, index) => ({value: index, text: kind})),

    AGE_RESTRICTION_LIST_FOR_SELECT = AGE_RESTRICTION_LIST.map((kind, index) => ({value: index, text: kind})),

    CAMERA_LOCATION_LIST_FOR_SELECT = CAMERA_LOCATION_LIST.map((kind, index) => ({value: index, text: kind})),

    getCountryOptionForSelect = item => ({value: item.ISO, text: item.name[DEFAULT_LANGUAGE]}),

    getCityOptionForSelect = item => ({
        value: item.id,
        text: (item.subdivision2Name ? (item.subdivision2Name[DEFAULT_LANGUAGE]) + "/" : "") + item.name[DEFAULT_LANGUAGE]
    }),

    getDefaultKindOption = kindId => ({value: kindId, text: ORG_KIND_LIST[kindId]}),

    getDefaultAgeRestrictionOption = ageId => ({value: ageId, text: AGE_RESTRICTION_LIST[ageId]}),

    getDefaultCameraLocationOption = cameraLocationId => ({value: cameraLocationId, text: CAMERA_LOCATION_LIST[cameraLocationId]});

registerPartialSchemaList(Object.keys(fields).map(key => fields[key]));

class ManageUser extends React.Component<ManageUserProps, ManageUserState> {
    state: ManageUserState;
    countryOptionList: SelectOption[] = [];
    defaultCountryOption: SelectOption;

    constructor(props, context) {
        super(props, context);

        this.onBlur = this.onBlur.bind(this);
        this.updateUserState = this.updateUserState.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.login = this.login.bind(this);

        const
            user = this.props.user,
            currentCountryISO = user.org && user.org.countryISO || DEFAULT_COUNTRY_ISO,
            isLogin = this.props["route"].path === "/signin",
            countryList = this.props.countryList,
            defaultCountry = this.props.countryList.find(country => country.ISO === currentCountryISO);

        user.org.countryISO = currentCountryISO;

        this.countryOptionList = countryList.map(getCountryOptionForSelect);

        this.defaultCountryOption = {value: defaultCountry.ISO, text: defaultCountry.name[DEFAULT_LANGUAGE]};

        this.state = {
            user,
            currentCountryISO,
            currentProvinceISO: null,
            cityOptionList: [],
            provinceOptionList: [],
            errors: {},
            isSaving: false,
            isLogin,
            isValid: isLogin ? validateLogin(user.local).length === 0 : validateUser(user).length === 0
        };

        this.setProvinceList();
    }

    componentWillReceiveProps(nextProps) {
        const newState: ManageUserState = {
            isLogin: nextProps["route"].path === "/signin"
        };

        if (this.props.user && this.props.user.id !== nextProps.user.id)
            newState.user = Object.assign({}, nextProps.user);

        this.setState(newState);
    }

    setProvinceList(ISO: string = this.state.currentCountryISO) {
        getProvincesByCountry(ISO)
            .then(provinceList => {
                if (provinceList && provinceList.length > 0) {
                    const user = this.state.user;
                    user.org.provinceISO = provinceList[0].ISO;

                    this.setState({
                        user,
                        currentProvinceISO: provinceList[0].ISO,
                        provinceOptionList: provinceList.map(getCountryOptionForSelect)
                    });
                }
                this.setCityList();
            });
    }

    setCityList(countryISO: string = this.state.currentCountryISO, provinceISO: string = this.state.currentProvinceISO) {
        (provinceISO
            ? getCitiesByCountryAndProvince(countryISO, provinceISO)
            : getCitiesByCountry(countryISO))
            .then((cityList = []) => {
                const user = this.state.user;
                user.org.cityId = cityList[0].id;
                this.setState({
                    user,
                    cityOptionList: cityList.map(getCityOptionForSelect)
                });
            });
    }

    onBlur(event) {
        const
            field = event.target.name,
            value = getObject(field, this.state.user),
            validationErrorList = validateFormInput(field, value),
            errors = Object.assign({}, this.state.errors);

        if (validationErrorList.length)
            errors[field] = validationErrorList[0].message;
        else if (errors[field])
            delete errors[field];

        this.setState({
            errors, isValid: this.state.isLogin
                ? validateLogin(filterObjectKeys(this.state.user.local, ["email", "password"])).length === 0
                : validateUser(this.state.user).length === 0
        });
    }

    updateUserState(event) {
        const
            field = event.target.name,
            value = (event.target.type === "checkbox") ? event.target.checked : ((field in transformMap) ? transformMap[field](event.target.value) : event.target.value),
            errors = Object.assign({}, this.state.errors),
            user = Object.assign({}, this.state.user);

        setObject(field, value, user);

        const stateObject: ManageUserState = {
            user,
            errors,
            isValid: this.state.isLogin
                ? validateLogin(filterObjectKeys(this.state.user.local, ["email", "password"])).length === 0
                : validateUser(this.state.user).length === 0
        };

        if (field === fields.orgCountryISO) {
            stateObject.currentCountryISO = value;

            this.setProvinceList(value);
        }

        if (field === fields.orgProvinceISO) {
            stateObject.currentProvinceISO = value;
            this.setCityList(this.state.currentCountryISO, value);
        }

        if (field === fields.orgCameraUrl && !errors[field]) {

        }

        if (errors[field]) {
            const validationErrorList = this.state.isLogin
                ? validateLogin(filterObjectKeys(this.state.user.local, ["email", "password"]))
                : validateFormInput(field, value);

            if (validationErrorList.length)
                errors[field] = validationErrorList[0].message;
            else
                delete errors[field];
        }

        this.setState(stateObject);
    }

    saveUser(event: Event) {
        event.preventDefault();

        const
            user = this.state.user,
            validationErrorList = validateUser(user);

        if (validationErrorList.length)
            return validationErrorList.forEach(error => notificationError(error.message));

        this.setState({isSaving: true});

        this.props.actions.save(user)
            .then(() => {
                this.setState({isSaving: false});

                notificationSuccess("User saved");

                browserHistory.push("/");
            })
            .catch(error => {
                this.setState({isSaving: false});

                notificationError(getErrorMessage(error, "user-register"));
            });
    }

    login(event: Event) {
        event.preventDefault();

        const user = this.state.user;

        this.setState({isSaving: true});

        this.props.actions.login(user.local)
            .then(() => {
                this.setState({isSaving: false});

                notificationSuccess("User logged in");

                browserHistory.push("/");
            })
            .catch(error => {
                this.setState({isSaving: false});

                notificationError(getErrorMessage(error, "user-login"));
            });
    }

    render() {
        return (this.state.isLogin
                ? <SignInForm
                    onBlur={this.onBlur}
                    onChange={this.updateUserState}
                    onLogin={this.login}
                    user={this.state.user}
                    fields={fields}
                    errors={this.state.errors}
                    isSaving={this.state.isSaving}
                    isValid={this.state.isValid}/>
                : <UserForm
                    onBlur={this.onBlur}
                    onChange={this.updateUserState}
                    onSave={this.saveUser}
                    user={this.state.user}
                    fields={fields}
                    orgKindList={ORG_KIND_LIST_FOR_SELECT}
                    defaultKindOption={getDefaultKindOption(this.state.user.org.kind || ORG_KIND_DEFAULT_ID)}
                    countryList={this.countryOptionList}
                    defaultCountryOption={this.defaultCountryOption}
                    provinceList={this.state.provinceOptionList}
                    cityList={this.state.cityOptionList}
                    cameraLocationList={CAMERA_LOCATION_LIST_FOR_SELECT}
                    defaultCameraLocationOption={getDefaultCameraLocationOption(this.state.user.org.camera.location || CAMERA_LOCATION_DEFAULT_ID)}
                    orgAgeRestrictionList={AGE_RESTRICTION_LIST_FOR_SELECT}
                    defaultAgeRestrictionOption={getDefaultAgeRestrictionOption(this.state.user.org.ageRestriction || AGE_RESTRICTION_DEFAULT_ID)}
                    errors={this.state.errors}
                    isSaving={this.state.isSaving}
                    isValid={this.state.isValid}/>
        );
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actionCreatorMapObject, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageUser);
