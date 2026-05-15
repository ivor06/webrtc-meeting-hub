import * as React from "react";
import {Link, IndexLink} from "react-router";

import {NavBarProps} from './types';
import {publishEvent} from "../../services/pubsub.service";

const NavBar = ({logoText, links, userName, isLogged, onLogout, onClick}: NavBarProps): JSX.Element => (
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
                    <li role="presentation"><IndexLink to="/" activeClassName="active">Home</IndexLink></li>
                    {!isLogged && <li role="presentation"><Link to="/signin" activeClassName="active">Sign in</Link></li>}
                    {!isLogged && <li role="presentation"><Link to="/signup" activeClassName="active">Sign up</Link></li>}
                    {<li role="presentation"><Link to="/search" activeClassName="active">Search</Link></li>}
                    {isLogged && <li role="presentation">
                        <div className="video-link" onClick={event => {
                            event.stopPropagation();
                            publishEvent("ManageVideo.show");
                        }}>Video
                        </div>
                    </li>}
                    {/*{isLogged && <li role="presentation"><Link to="/profile" activeClassName="active">Profile</Link></li>}*/}
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
