export declare enum NodeDependencyType {
    Default = "dependencies",
    Dev = "devDependencies",
    Peer = "peerDependencies",
    Optional = "optionalDependencies"
}
export interface NodeDependency {
    type: NodeDependencyType;
    name: string;
    version: string;
    overwrite?: boolean;
}
export declare enum pkgJson {
    Path = "/package.json"
}
export interface DeleteNodeDependency {
    type: NodeDependencyType;
    name: string;
}
export interface NodePackage {
    name: string;
    version: string;
}
export interface SchematicsOptions {
    yes: boolean;
    yarn: boolean;
    noWizard?: boolean;
    noBuilder?: boolean;
    removeProtractor?: boolean;
    __version__: number;
}
