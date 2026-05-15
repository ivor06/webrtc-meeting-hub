import * as React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";

import {store} from './store/configureStore';
import {routes} from "./routes";

import "../node_modules/bootstrap/dist/css/bootstrap.css";

import "../node_modules/izitoast/dist/css/iziToast.min.css";

import "../node_modules/fixed-data-table/dist/fixed-data-table.min.css";

import "./style.scss";
import "./spinner.scss";

render(
    <Provider store={store}>
        {routes}
    </Provider>,
    document.getElementById("app")
);
