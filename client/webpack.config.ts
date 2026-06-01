import path from "path";
import type * as webpack from "webpack";

const config: webpack.Configuration = {
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
        filename: "bundle.js",
        clean: false
    },
    module: {
        rules: [
            {
                test: /\w{2,}\.tsx?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                }
            },
            {
                test: /\.(css)$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(sass|scss)$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, type: "asset/resource"},
            {test: /\.(woff|woff2)$/, type: "asset", parser: {dataUrlCondition: {maxSize: 5000}}},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, type: "asset", parser: {dataUrlCondition: {maxSize: 10000}}},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, type: "asset", parser: {dataUrlCondition: {maxSize: 10000}}},
            {test: /\.(png|jpg|jpeg)$/, type: "asset", parser: {dataUrlCondition: {maxSize: 20000}}}
        ]
    },
    target: "web",
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "react-router": "ReactRouter"
    }
};

export default config;
