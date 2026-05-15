import * as React from "react";
import {connect, Prodiver} from "react-redux";
import {bindActionCreators} from "redux";

import {User} from "../../../../common/classes/User";
import {actionCreatorMapObject} from "./actions";
import {NavBar} from "../../components/index";
import {AppProps, AppState} from "./types";
import {getToken} from "../../services/localStorage.service";

class App extends React.Component<AppProps, AppState> {
    constructor(props) {
        super(props);

        if (getToken())
            this.props.actions.loginToken();

        setTimeout(() => {
            const spinner = document.getElementById("spinner-main");
            try {
                spinner.remove();
            } catch (e) {
                console.error(e);
            }
        }, 500);
    }

    render() {
        return (
            <div className="container-fluid">
                <NavBar
                    logoText="My logo"
                    isLogged={this.props.isLogged}
                    userName={User.getName(this.props.user)}
                    onLogout={this.props.actions.logout}/>
                {this.props.children}
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
