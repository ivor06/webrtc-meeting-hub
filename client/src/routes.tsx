import * as React from 'react';
import {IndexRoute, Route, Router, browserHistory} from 'react-router';
import {Provider} from "react-redux";

import {Home} from './components/index';
import {App, ManageUser} from './containers/index';

export const routes = (
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Home}/>
            <Route path="/signin" component={ManageUser}/>
            <Route path="/signup" component={ManageUser}/>
            <Route path="/profile/edit" component={ManageUser}/>
        </Route>
    </Router>
);
