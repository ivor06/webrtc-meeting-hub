import path from "path";
import type * as webpack from "webpack";
import "webpack-dev-server";

const config: webpack.Configuration = {
    devtool: "eval-cheap-module-source-map",
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
        path: path.join(__dirname, "/build"),
        publicPath: "/",
        filename: "bundle.js"
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "src")
        }
    },
    module: {
        rules: [
            {
                test: /\w{2,}\.tsx?$/,
                exclude: /node_modules|\.d\.ts$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                }
            },
            {test: /\.css$/, use: ["style-loader", "css-loader"]},
            {test: /\.(sass|scss)$/, use: ["style-loader", "css-loader", "sass-loader"]},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, type: "asset/resource"},
            {test: /\.(woff|woff2)$/, type: "asset", parser: {dataUrlCondition: {maxSize: 5000}}},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, type: "asset", parser: {dataUrlCondition: {maxSize: 10000}}},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, type: "asset", parser: {dataUrlCondition: {maxSize: 10000}}},
            {test: /\.(png|jpg|jpeg)$/, type: "asset", parser: {dataUrlCondition: {maxSize: 20000}}},
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-router": "ReactRouter"
    }
};

export default config;
