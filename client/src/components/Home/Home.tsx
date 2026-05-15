import * as React from "react";

import {HomeProps} from "./types";

const Home = ({greeting}: HomeProps) => (
    <div className="jumbotron">
        <h2>{greeting || "Look for show project"}</h2>
    </div>
);

export default Home;
