/// <reference types="node" />
export declare function writeFileRecursively(path: string, data: string | Buffer, outputFileSystem: any): Promise<unknown>;
export declare function readDirRecursively(dir: string, inputFileSystem: any, callback: any): void;
