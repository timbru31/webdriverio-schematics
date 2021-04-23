"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TS_CONFIG = void 0;
exports.TS_CONFIG = {
    extends: '../tsconfig.json',
    compilerOptions: {
        module: 'commonjs',
        target: 'es5',
        types: ['node', 'webdriverio/sync', 'expect-webdriverio']
    }
};
//# sourceMappingURL=constants.js.map