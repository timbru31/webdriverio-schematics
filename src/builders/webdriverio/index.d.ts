import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import type { RunCommandArguments } from '@wdio/cli';
declare const _default: import("@angular-devkit/architect/src/internal").Builder<JsonObject & Options>;
export default _default;
interface Options extends RunCommandArguments {
    configFile: string;
    devServerTarget: string;
    watch: boolean;
}
export declare function execute(options: Options, context: BuilderContext): Promise<BuilderOutput>;
