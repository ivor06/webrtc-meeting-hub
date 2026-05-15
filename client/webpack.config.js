const
    webpack = require("webpack"),
    path = require("path");

module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.json', '.js', '.jsx'],
        modules: [
            "node_modules",
            path.resolve(__dirname, "src")
        ]
    },
    entry: "./src/main.tsx",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\w{2,}\.tsx?$/,
                loader: 'awesome-typescript-loader',
            },
            {
                test: /\.(css)$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(sass|scss)$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
            {test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml"},
            {test: /\.(png|jpg|jpeg)$/, loader: "url-loader?limit=20000"}
        ]
    },
    target: "web",
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-router": "ReactRouter"
    }
};