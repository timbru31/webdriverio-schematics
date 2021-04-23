import { Tree } from '@angular-devkit/schematics';
import { NodeDependency, DeleteNodeDependency, NodePackage } from '../types';
export declare function getAngularJsonValue(tree: Tree): any;
export declare function getAngularVersion(tree: Tree): number;
export declare function deleteDirectory(tree: Tree, path: string): void;
export declare function removePackageJsonDependency(tree: Tree, dependency: DeleteNodeDependency): void;
/**
 * Attempt to retrieve the latest package version from NPM
 * Return an optional "latest" version in case of error
 * @param packageName
 */
export declare function getLatestNodeVersion(packageName: string): Promise<NodePackage>;
export declare function addPackageJsonDependency(tree: Tree, dependency: NodeDependency): void;
export declare const removeE2ELinting: (tree: Tree, angularJsonVal: any, project: string) => void;
export declare const addWDIOTsConfig: (tree: Tree, angularJsonVal: any, projectName: string) => void;
