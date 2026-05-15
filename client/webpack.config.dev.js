const webpack = require("webpack");
const path = require("path");

module.exports = {
    devtool: "cheap-module-eval-source-map",
    entry: [
        "./src/main.tsx"
    ],
    target: "web",
    resolve: {
        extensions: ['.ts', '.tsx', '.json', '.js', '.jsx', ".css"],
        modules: [
            "node_modules",
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, "src")
        ]
    },
    output: {
        path: __dirname + "/build",
        publicPath: "/",
        filename: "bundle.js"
    },
    devServer: {
        contentBase: "./src"
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {test: /\w{2,}\.tsx?$/, exclude: /\.d\.ts$/, loader: 'awesome-typescript-loader'},
            {test: /\.css$/, use: ["style-loader", "css-loader"]},
            {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
            {test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml"},
            {test: /\.(png|jpg|jpeg)$/, loader: "url-loader?limit=20000"},
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-router": "ReactRouter"
    }
};