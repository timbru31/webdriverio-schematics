"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const path = require("path");
const fs = require("fs");
const url = require("url");
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
exports.default = architect_1.createBuilder(execute);
function execute(options, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const Launcher = require(path.join(process.cwd(), 'node_modules', '@wdio', 'cli')).default;
        // ensure that only one of these options is used
        if (options.devServerTarget && options.baseUrl) {
            throw new Error(core_1.tags.stripIndents `
            The 'baseUrl' option cannot be used with 'devServerTarget'.
            When present, 'devServerTarget' will be used to automatically setup 'baseUrl' for WebdriverIO.
        `);
        }
        let baseUrl = options.baseUrl;
        let server;
        if (options.devServerTarget) {
            const target = architect_1.targetFromTargetString(options.devServerTarget);
            const serverOptions = yield context.getTargetOptions(target);
            const overrides = {
                watch: false,
                host: serverOptions.host,
                port: serverOptions.port
            };
            server = yield context.scheduleTarget(target, overrides);
            const result = yield server.result;
            if (!result.success) {
                return { success: false };
            }
            if (typeof serverOptions.publicHost === 'string') {
                let publicHost = serverOptions.publicHost;
                if (!/^\w+:\/\//.test(publicHost)) {
                    publicHost = `${serverOptions.ssl
                        ? 'https'
                        : 'http'}://${publicHost}`;
                }
                const clientUrl = url.parse(publicHost);
                baseUrl = url.format(clientUrl);
            }
            else if (typeof result.baseUrl === 'string') {
                baseUrl = result.baseUrl;
            }
        }
        // Like the baseUrl in protractor config file when using the API we need to add
        // a trailing slash when provide to the baseUrl.
        if (baseUrl && !baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        let result;
        try {
            if (!options.configFile) {
                const defaultConfigPath = yield Promise.all([
                    path.join(process.cwd(), 'wdio.conf.js'),
                    path.join(process.cwd(), 'wdio.conf.ts')
                ].map((path) => (fs.promises.stat(path).then(() => path, () => null)))).then(((res) => res.find(Boolean)));
                if (!defaultConfigPath) {
                    throw new Error('missing parameter: --configFile /path/to/wdio.conf.ts');
                }
                options.configFile = defaultConfigPath;
            }
            const launcher = new Launcher(options.configFile, Object.assign(Object.assign({}, options), { baseUrl: baseUrl }));
            result = yield launcher.run().then((exitCode) => ({
                success: exitCode === 0
            }), (err) => ({
                error: err.message,
                success: false,
            }));
        }
        catch (err) {
            result = {
                error: err.message,
                success: false
            };
        }
        finally {
            if (server) {
                yield server.stop();
            }
            if (!result) {
                return { success: false };
            }
            return result;
        }
    });
}
exports.execute = execute;
//# sourceMappingURL=index.js.map