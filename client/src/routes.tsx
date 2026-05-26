import * as React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router';

import {Home} from './components/index';
import {App, ManageUser} from './containers/index';

export const routes = (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App/>}>
                <Route index element={<Home/>}/>
                <Route path="signin" element={<ManageUser/>}/>
                <Route path="signup" element={<ManageUser/>}/>
                <Route path="profile/edit" element={<ManageUser/>}/>
            </Route>
        </Routes>
    </BrowserRouter>
);
