"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWDIOTsConfig = exports.removeE2ELinting = exports.addPackageJsonDependency = exports.getLatestNodeVersion = exports.removePackageJsonDependency = exports.deleteDirectory = exports.getAngularVersion = exports.getAngularJsonValue = void 0;
const http_1 = require("http");
const schematics_1 = require("@angular-devkit/schematics");
const types_1 = require("../types");
const json_1 = require("./json");
function getAngularJsonValue(tree) {
    const angularJsonAst = json_1.parseJsonAtPath(tree, './angular.json');
    return angularJsonAst.value;
}
exports.getAngularJsonValue = getAngularJsonValue;
function getAngularVersion(tree) {
    const packageNode = getPackageJsonDependency(tree, '@angular/core');
    const version = packageNode && packageNode.version.split('').find((char) => !!parseInt(char, 10));
    return version ? +version : 0;
}
exports.getAngularVersion = getAngularVersion;
function deleteDirectory(tree, path) {
    try {
        tree.delete(path);
    }
    catch (_a) { }
}
exports.deleteDirectory = deleteDirectory;
function findPropertyInAstObject(node, propertyName) {
    let maybeNode = null;
    for (const property of node.properties) {
        if (property.key.value == propertyName) {
            maybeNode = property.value;
        }
    }
    return maybeNode;
}
function getPackageJsonDependency(tree, name) {
    const packageJson = json_1.parseJsonAtPath(tree, types_1.pkgJson.Path);
    let dep = null;
    [
        types_1.NodeDependencyType.Default,
        types_1.NodeDependencyType.Dev,
        types_1.NodeDependencyType.Optional,
        types_1.NodeDependencyType.Peer
    ].forEach((depType) => {
        if (dep !== null) {
            return;
        }
        const depsNode = findPropertyInAstObject(packageJson, depType);
        if (depsNode !== null && depsNode.kind === 'object') {
            const depNode = findPropertyInAstObject(depsNode, name);
            if (depNode !== null && depNode.kind === 'string') {
                const version = depNode.value;
                dep = {
                    type: depType,
                    name: name,
                    version: version
                };
            }
        }
    });
    return dep;
}
function removePackageJsonDependency(tree, dependency) {
    const packageJsonAst = json_1.parseJsonAtPath(tree, types_1.pkgJson.Path);
    const depsNode = findPropertyInAstObject(packageJsonAst, dependency.type);
    const recorder = tree.beginUpdate(types_1.pkgJson.Path);
    if (!depsNode) {
        // Haven't found the dependencies key.
        new schematics_1.SchematicsException('Could not find the package.json dependency');
        return tree.commitUpdate(recorder);
    }
    if (depsNode.kind === 'object') {
        const fullPackageString = depsNode.text
            .split('\n')
            .filter((pkg) => pkg.includes(`"${dependency.name}"`))[0];
        const commaDangle = (fullPackageString &&
            fullPackageString.trim().slice(-1) === ',' ? 1 : 0);
        const packageAst = depsNode.properties.find((node) => (node.key.value.toLowerCase() === dependency.name.toLowerCase()));
        // TODO: does this work for the last dependency?
        const newLineIndentation = 5;
        if (packageAst) {
            // Package found, remove it.
            const end = packageAst.end.offset + commaDangle;
            recorder.remove(packageAst.key.start.offset, end - packageAst.start.offset + newLineIndentation);
        }
        return tree.commitUpdate(recorder);
    }
}
exports.removePackageJsonDependency = removePackageJsonDependency;
/**
 * Attempt to retrieve the latest package version from NPM
 * Return an optional "latest" version in case of error
 * @param packageName
 */
function getLatestNodeVersion(packageName) {
    const DEFAULT_VERSION = 'latest';
    return new Promise((resolve) => {
        return http_1.get(`http://registry.npmjs.org/${packageName}`, (res) => {
            let rawData = '';
            res.on('data', (chunk) => (rawData += chunk));
            res.on('end', () => {
                try {
                    const response = JSON.parse(rawData);
                    const version = (response && response['dist-tags']) || {};
                    resolve(buildPackage(packageName, version.latest));
                }
                catch (e) {
                    resolve(buildPackage(packageName));
                }
            });
        }).on('error', () => resolve(buildPackage(packageName)));
    });
    function buildPackage(name, version = DEFAULT_VERSION) {
        return { name, version };
    }
}
exports.getLatestNodeVersion = getLatestNodeVersion;
function addPackageJsonDependency(tree, dependency) {
    const packageJsonAst = json_1.parseJsonAtPath(tree, types_1.pkgJson.Path);
    const depsNode = findPropertyInAstObject(packageJsonAst, dependency.type);
    const recorder = tree.beginUpdate(types_1.pkgJson.Path);
    if (!depsNode) {
        // Haven't found the dependencies key, add it to the root of the package.json.
        json_1.appendPropertyInAstObject(recorder, packageJsonAst, dependency.type, {
            [dependency.name]: dependency.version,
        }, 4);
    }
    else if (depsNode.kind === 'object') {
        // check if package already added
        const depNode = findPropertyInAstObject(depsNode, dependency.name);
        if (!depNode) {
            // Package not found, add it.
            json_1.insertPropertyInAstObjectInOrder(recorder, depsNode, dependency.name, dependency.version, 4);
        }
        else if (dependency.overwrite) {
            // Package found, update version if overwrite.
            const { end, start } = depNode;
            recorder.remove(start.offset, end.offset - start.offset);
            recorder.insertRight(start.offset, JSON.stringify(dependency.version));
        }
    }
    tree.commitUpdate(recorder);
}
exports.addPackageJsonDependency = addPackageJsonDependency;
const removeE2ELinting = (tree, angularJsonVal, project) => {
    var _a, _b, _c, _d, _e;
    const projectLintOptionsJson = (_c = (_b = (_a = angularJsonVal.projects[project]) === null || _a === void 0 ? void 0 : _a.architect) === null || _b === void 0 ? void 0 : _b.lint) === null || _c === void 0 ? void 0 : _c.options;
    if (projectLintOptionsJson) {
        let filteredTsConfigPaths;
        if (Array.isArray(projectLintOptionsJson['tsConfig'])) {
            filteredTsConfigPaths = (_d = projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig) === null || _d === void 0 ? void 0 : _d.filter((path) => {
                const pathIncludesE2e = path.includes('e2e');
                return !pathIncludesE2e && path;
            });
        }
        else {
            filteredTsConfigPaths = !((_e = projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig) === null || _e === void 0 ? void 0 : _e.includes('e2e'))
                ? projectLintOptionsJson === null || projectLintOptionsJson === void 0 ? void 0 : projectLintOptionsJson.tsConfig
                : '';
        }
        projectLintOptionsJson['tsConfig'] = filteredTsConfigPaths;
    }
    return tree.overwrite('./angular.json', JSON.stringify(angularJsonVal, null, 2));
};
exports.removeE2ELinting = removeE2ELinting;
const addWDIOTsConfig = (tree, angularJsonVal, projectName) => {
    var _a, _b, _c;
    const project = angularJsonVal.projects[projectName];
    let tsConfig = (_c = (_b = (_a = project === null || project === void 0 ? void 0 : project.architect) === null || _a === void 0 ? void 0 : _a.lint) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.tsConfig;
    if (tsConfig) {
        let prefix = '';
        if (project.root) {
            prefix = `${project.root}/`;
        }
        if (!Array.isArray(tsConfig)) {
            project.architect.lint.options.tsConfig = tsConfig = [tsConfig];
        }
        tsConfig.push(`${prefix}webdriverio/tsconfig.json`);
    }
    return tree.overwrite('./angular.json', JSON.stringify(angularJsonVal, null, 2));
};
exports.addWDIOTsConfig = addWDIOTsConfig;
//# sourceMappingURL=index.js.map