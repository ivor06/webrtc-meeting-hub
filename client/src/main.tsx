import * as React from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";

import {store} from './store/configureStore';
import {routes} from "./routes";

import "bootstrap/dist/css/bootstrap.css";

import "izitoast/dist/css/iziToast.min.css";

import "./spinner.css";

createRoot(document.getElementById("app") as HTMLElement).render(
    <Provider store={store}>
        {routes}
    </Provider>
);
