import { ILogger, TreeLog } from "trm-core";
import { ResponseMessage } from "trm-registry-types";
export declare class GithubLogger implements ILogger {
    debug: boolean;
    constructor(debug: boolean);
    loading(text: string, debug?: boolean): void;
    success(text: string, debug?: boolean): void;
    error(text: string, debug?: boolean): void;
    warning(text: string, debug?: boolean): void;
    info(text: string, debug?: boolean): void;
    log(text: string, debug?: boolean): void;
    table(header: any, data: any, debug?: boolean): void;
    registryResponse(response: ResponseMessage, debug?: boolean): void;
    tree(data: TreeLog, debug?: boolean): void;
}
