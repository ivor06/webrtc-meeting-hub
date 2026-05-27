import * as React from "react";
import {NavLink} from "react-router";

import {NavBarProps} from './types';
import {publishEvent} from "../../services/pubsub.service";

const navLinkClassName = ({isActive}) => isActive ? "nav-link active" : "nav-link";

const NavBar = ({logoText, links, userName, isLogged, onLogout, onClick}: NavBarProps): React.ReactElement => (
    <nav className="navbar navbar-expand-md navbar-light bg-light fixed-top">
        <div className="container-fluid d-flex">
            <div className="navbar-header">
                <a className="navbar-brand brand">
                    <img src="./favicon.ico"/>
                </a>
                <div className="navbar-brand brand">{logoText}</div>
                <div className="btn-group dropdown float-end">
                    <button
                        type="button"
                        className="navbar-toggler collapsed"
                        data-bs-toggle="collapse"
                        aria-expanded="false"
                        role="navigation">
                        <span className="visually-hidden">Toggle navigation</span>
                        <span className="navbar-toggler-icon"> </span>
                    </button>
                    <ul
                        className="dropdown-menu menu-xs-mode"
                        role="menu">
                        <li role="presentation">
                            <button className="btn btn-outline-secondary">
                                News
                            </button>
                        </li>
                        <li role="presentation">
                            <button className="btn btn-outline-secondary">
                                Feedback
                            </button>
                        </li>
                        <li role="presentation">
                            <button className="btn btn-outline-secondary">
                                Give feedback
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <ul className="nav navbar-nav" onClick={onClick}>
                    <li role="presentation"><NavLink to="/" end className={navLinkClassName}>Home</NavLink></li>
                    {!isLogged && <li role="presentation"><NavLink to="/signin" className={navLinkClassName}>Sign in</NavLink></li>}
                    {!isLogged && <li role="presentation"><NavLink to="/signup" className={navLinkClassName}>Sign up</NavLink></li>}
                    {<li role="presentation"><NavLink to="/search" className={navLinkClassName}>Search</NavLink></li>}
                    {isLogged && <li role="presentation">
                        <div className="video-link" onClick={event => {
                            event.stopPropagation();
                            publishEvent("ManageVideo.show");
                        }}>Video
                        </div>
                    </li>}
                    {/*{isLogged && <li role="presentation"><NavLink to="/profile" className={navLinkClassName}>Profile</NavLink></li>}*/}
                    {isLogged && <li role="presentation">
                        <div className="navbar-padding-top-bottom">Signed as <a>{userName}</a></div>
                    </li>}
                    {isLogged && <li role="presentation">
                        <button className="btn btn-primary margin-auto" onClick={onLogout}>Logout</button>
                    </li>}
                </ul>
            </div>
        </div>
    </nav>
);

export default NavBar;
