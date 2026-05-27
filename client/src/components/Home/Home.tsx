import * as React from "react";

import {HomeProps} from "./types";

const Home = ({greeting}: HomeProps) => (
    <div className="p-5 mb-4 bg-light rounded-3">
        <h2>{greeting || "Look for show project"}</h2>
    </div>
);

export default Home;
