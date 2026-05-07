import { Message } from "trm-registry-types";
import { ILogger, ILoggerMultibar, ILoggerProgressbar, TreeLog } from "trm-commons";
export declare class GithubLogger implements ILogger {
    debug: boolean;
    private _prefix;
    constructor(debug: boolean);
    loading(text: string, debug?: boolean): void;
    success(text: string, debug?: boolean): void;
    error(text: string, debug?: boolean): void;
    warning(text: string, debug?: boolean): void;
    info(text: string, debug?: boolean): void;
    log(text: string, debug?: boolean): void;
    table(header: string[], data: string[][], debug?: boolean): void;
    registryResponse(response: Message, debug?: boolean): void;
    tree(data: TreeLog, debug?: boolean): void;
    setPrefix(text: string): void;
    removePrefix(): void;
    getPrefix(): string;
    msgty(msgty: string, text: string, debug?: boolean): void;
    forceStop(): void;
    progressbar(format: string, glue: string): ILoggerProgressbar;
    multibar(format: string, glue: string): ILoggerMultibar;
}
