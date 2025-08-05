/* eslint-env node */
module.exports = {
    automock: false,
    /** ol prints errors without HTMLCanvasElement being available in test environment */
    setupFiles: ["jest-canvas-mock"],
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["./jest.setup.js"],
    verbose: true,
    /** mapping svg to string representation since jest can't handle svg */
    moduleNameMapper: {
        "marker.svg": "<rootDir>node_modules/masterportalAPI/public/stringMarker.js",
        "olcs/lib/olcs/(.*)$": "<rootDir>/node_modules/olcs/lib/olcs/$1"
    },
    transformIgnorePatterns: ["/node_modules/(?!(masterportalAPI|ol|olcs|ol-mapbox-style|geotiff|quick-lru|color-space|color-rgba|color-parse|color-name)/).*/"],
    testMatch: ["<rootDir>/test/**/?(*.)(spec|test).js"],
    testPathIgnorePatterns: ["<rootDir>/(node_modules|bin|build)"],
    transform: {
        ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
        "^.+\\.(t|j)sx?$": "@swc/jest"
    }
};
