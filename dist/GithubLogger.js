"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubLogger = void 0;
const core = __importStar(require("@actions/core"));
const trm_registry_types_1 = require("trm-registry-types");
class GithubLogger {
    constructor(debug) { }
    loading(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }
    success(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }
    error(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        core.error(text);
    }
    warning(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        core.warning(text);
    }
    info(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.info(text);
    }
    log(text, debug) {
        if (debug && !this.debug) {
            core.debug(text);
            return;
        }
        console.log(text);
    }
    table(header, data, debug) {
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
    registryResponse(response, debug) {
        if (debug && !this.debug) {
            core.debug(response.text);
            return;
        }
        if (response.type === trm_registry_types_1.MessageType.ERROR) {
            this.error(response.text, debug);
        }
        if (response.type === trm_registry_types_1.MessageType.INFO) {
            this.info(response.text, debug);
        }
        if (response.type === trm_registry_types_1.MessageType.WARNING) {
            this.warning(response.text, debug);
        }
    }
    tree(data, debug) {
        if (debug && !this.debug) {
            core.debug(JSON.stringify(data));
            return;
        }
        console.log(JSON.stringify(data));
    }
}
exports.GithubLogger = GithubLogger;
