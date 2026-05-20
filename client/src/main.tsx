import * as React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";

import {store} from './store/configureStore';
import {routes} from "./routes";

import "bootstrap/dist/css/bootstrap.css";

import "izitoast/dist/css/iziToast.min.css";

import "fixed-data-table/dist/fixed-data-table.css";

import "./spinner.css";

render(
    <Provider store={store}>
        {routes}
    </Provider>,
    document.getElementById("app")
);
