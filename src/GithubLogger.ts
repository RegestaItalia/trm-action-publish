import { ILogger, TreeLog } from "trm-core";
import * as core from "@actions/core";
import { MessageType, ResponseMessage } from "trm-registry-types";

export class GithubLogger implements ILogger {
    debug: boolean;

    constructor(debug: boolean) { }

    public loading(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }

    public success(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }

    public error(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        core.error(text);
    }

    public warning(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        core.warning(text);
    }

    public info(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.info(text);
    }

    public log(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }

    public table(header: any, data: any, debug?: boolean) {
        const table = {
            header,
            data
        };
        if (debug && !this.debug) {
            core.debug(JSON.stringify(table));
            return;
        }
        console.log(JSON.stringify(table));
    }

    public registryResponse(response: ResponseMessage, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(response.text);
            return;
        }
        if (response.type === MessageType.ERROR) {
            this.error(response.text, debug);
        }
        if (response.type === MessageType.INFO) {
            this.info(response.text, debug);
        }
        if (response.type === MessageType.WARNING) {
            this.warning(response.text, debug);
        }
    }

    public tree(data: TreeLog, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(JSON.stringify(data));
            return;
        }
        console.log(JSON.stringify(data));
    }
}