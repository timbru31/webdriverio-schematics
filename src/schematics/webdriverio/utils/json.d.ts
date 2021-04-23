import { JsonAstArray, JsonAstNode, JsonAstObject, JsonValue } from '@angular-devkit/core';
import { UpdateRecorder, Tree } from '@angular-devkit/schematics';
export declare function appendPropertyInAstObject(recorder: UpdateRecorder, node: JsonAstObject, propertyName: string, value: JsonValue, indent: number): void;
export declare function insertPropertyInAstObjectInOrder(recorder: UpdateRecorder, node: JsonAstObject, propertyName: string, value: JsonValue, indent: number): void;
export declare function appendValueInAstArray(recorder: UpdateRecorder, node: JsonAstArray, value: JsonValue, indent?: number): void;
export declare function findPropertyInAstObject(node: JsonAstObject, propertyName: string): JsonAstNode | null;
export declare function parseJsonAtPath(tree: Tree, path: string): JsonAstObject;
