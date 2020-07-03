export interface Args {
    "--pro": boolean;
    "--export": boolean;
    "--export-fly": boolean;
    "--disk": boolean;
    "--ssr": boolean;
    "--port": number;
    "--addr": string;
    "--conf": string;
    "--verbose": boolean;
    "--log-mode": "silent" | "plain";
    "--disable-plugins": boolean;
    "--root": string;
    "--src": string;
    "--pages": string;
    "--out": string;
    "--dist": string;
    "--cache": string;
    "--fly": string;
    "--lib": string;
    "--map": string;
    "--static": string;
    "--plugins": string;
}
export declare function getArgs(): Args;
