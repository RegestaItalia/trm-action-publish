import * as core from "@actions/core";
import { MessageType, ResponseMessage } from "trm-registry-types";
import styles from 'ansi-styles';
import { ILogger, TreeLog } from "trm-commons";

export class GithubLogger implements ILogger {
    debug: boolean;
    private _prefix: string = '';

    constructor(debug: boolean) { }

    public loading(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(`${styles.blue.open}${text}${styles.blue.close}`);
    }

    public success(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(`${styles.green.open}${text}${styles.green.close}`);
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
        console.log(`${styles.dim.open}${text}${styles.dim.close}`);
    }

    public table(header: string[], data: string[][], debug?: boolean) {
        const table = {
            header,
            data
        };
        if (debug && !this.debug) {
            core.debug(JSON.stringify(table));
            return;
        }
        console.log(header.map(h => `${styles.bold.open}${h}${styles.bold.close}`).join(','));
        data.forEach(d => {
            console.log(d.join(','));
        });
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

    public setPrefix(text: string): void {
        this._prefix = text;
    }

    public removePrefix(): void {
        this._prefix = "";
    }

    public getPrefix(): string {
        return this._prefix;
    }

    public msgty(msgty: string, text: string, debug?: boolean){
        switch(msgty){
            case 'A':
                this.error(text, debug);
                break;
            case 'E':
                this.error(text, debug);
                break;
            case 'I':
                this.info(text, debug);
                break;
            case 'S':
                this.success(text, debug);
                break;
            case 'W':
                this.warning(text, debug);
                break;
        }
    }

}