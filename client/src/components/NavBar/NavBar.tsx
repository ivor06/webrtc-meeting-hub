import * as React from "react";
import {NavLink} from "react-router";

import {NavBarProps} from './types';
import {publishEvent} from "../../services/pubsub.service";

const activeClassName = ({isActive}) => isActive ? "active" : undefined;

const NavBar = ({logoText, links, userName, isLogged, onLogout, onClick}: NavBarProps): React.ReactElement => (
    <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid flex">
            <div className="navbar-header">
                <a className="navbar-brand brand">
                    <img src="./favicon.ico"/>
                </a>
                <div className="navbar-brand brand">{logoText}</div>
                <div className="btn-group dropdown float-right">
                    <button
                        type="button"
                        className="navbar-toggle collapsed"
                        data-toggle="collapse"
                        aria-expanded="false"
                        role="navigation">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"> </span>
                        <span className="icon-bar"> </span>
                        <span className="icon-bar"> </span>
                    </button>
                    <ul
                        className="dropdown-menu menu-xs-mode"
                        role="menu">
                        <li role="presentation">
                            <button className="btn btn-default">
                                News
                            </button>
                        </li>
                        <li role="presentation">
                            <button className="btn btn-default">
                                Feedback
                            </button>
                        </li>
                        <li role="presentation">
                            <button className="btn btn-default">
                                Give feedback
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <ul className="nav navbar-nav" onClick={onClick}>
                    <li role="presentation"><NavLink to="/" end className={activeClassName}>Home</NavLink></li>
                    {!isLogged && <li role="presentation"><NavLink to="/signin" className={activeClassName}>Sign in</NavLink></li>}
                    {!isLogged && <li role="presentation"><NavLink to="/signup" className={activeClassName}>Sign up</NavLink></li>}
                    {<li role="presentation"><NavLink to="/search" className={activeClassName}>Search</NavLink></li>}
                    {isLogged && <li role="presentation">
                        <div className="video-link" onClick={event => {
                            event.stopPropagation();
                            publishEvent("ManageVideo.show");
                        }}>Video
                        </div>
                    </li>}
                    {/*{isLogged && <li role="presentation"><NavLink to="/profile" className={activeClassName}>Profile</NavLink></li>}*/}
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
