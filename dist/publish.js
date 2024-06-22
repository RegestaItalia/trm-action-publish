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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = void 0;
const trm_core_1 = require("trm-core");
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const GithubLogger_1 = require("./GithubLogger");
const _getRegistry = (endpoint, auth) => __awaiter(void 0, void 0, void 0, function* () {
    const registry = new trm_core_1.Registry(endpoint);
    if (auth) {
        var oAuth;
        try {
            oAuth = JSON.parse(auth);
        }
        catch (e) {
            throw new Error(`Invalid registry authentication data.`);
        }
        trm_core_1.Logger.loading(`Logging into registry...`);
        yield registry.authenticate(oAuth);
        const whoami = yield registry.whoAmI();
        const ping = yield registry.ping();
        trm_core_1.Logger.success(`Logged in as "${whoami.username}"`);
        if (ping.wallMessage) {
            trm_core_1.Logger.registryResponse(ping.wallMessage);
        }
    }
    return registry;
});
const _getReadme = (iReadme) => {
    if (iReadme) {
        try {
            return fs.readFileSync(iReadme).toString();
        }
        catch (e) {
            return iReadme;
        }
    }
};
const _getCustTransports = (iCustTransports) => {
    var customizingTransports;
    try {
        customizingTransports = iCustTransports.split(',');
    }
    catch (e) {
        customizingTransports = [];
    }
    return customizingTransports;
};
const _getDependencies = (iDependencies) => {
    var dependencies;
    try {
        dependencies = JSON.parse(iDependencies).map(o => {
            return {
                name: o.name,
                version: o.version,
                integrity: o.integrity,
                registry: o.registry
            };
        });
    }
    catch (e) {
        dependencies = [];
    }
    dependencies.forEach(o => {
        if (!o.name) {
            throw new Error(`Package dependencies input: missing dependency name.`);
        }
        if (!o.version) {
            throw new Error(`Package dependencies input: missing dependency version.`);
        }
        if (!o.integrity) {
            throw new Error(`Package dependencies input: missing dependency integrity.`);
        }
    });
    return dependencies;
};
const _getSapEntries = (iSapEntries) => {
    var sapEntries;
    try {
        sapEntries = JSON.parse(iSapEntries);
        if (Array.isArray(sapEntries)) {
            throw new Error(`SAP Entries input: invalid JSON.`);
        }
    }
    catch (e) {
        sapEntries = {};
    }
    Object.keys(sapEntries).forEach(k => {
        if (!Array.isArray(sapEntries[k])) {
            throw new Error(`SAP Entries input: invalid JSON.`);
        }
        sapEntries[k].forEach(o => {
            if (!Array.isArray(o)) {
                throw new Error(`SAP Entries input: invalid JSON.`);
            }
            if (Object.keys(o).length === 0) {
                throw new Error(`SAP Entries input: invalid JSON.`);
            }
        });
    });
    return sapEntries;
};
const _getKeywords = (iKeywords) => {
    if (!iKeywords) {
        return [];
    }
    var keywords;
    try {
        keywords = JSON.parse(iKeywords);
    }
    catch (e) {
        keywords = iKeywords.split(',');
    }
    return keywords;
};
function publish(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const debug = core.isDebug();
        if (data.simpleLog) {
            trm_core_1.Logger.logger = new trm_core_1.ConsoleLogger(debug);
        }
        else {
            trm_core_1.Logger.logger = new GithubLogger_1.GithubLogger(debug);
        }
        trm_core_1.Inquirer.inquirer = new trm_core_1.CliInquirer();
        trm_core_1.SystemConnector.systemConnector = new trm_core_1.ServerSystemConnector({
            dest: data.systemDest,
            ashost: data.systemAsHost,
            sysnr: data.systemSysnr,
            saprouter: data.systemSapRouter
        }, {
            client: data.systemClient,
            user: data.systemUser,
            passwd: data.systemPassword,
            lang: data.systemLang
        });
        yield trm_core_1.SystemConnector.connect();
        const registry = yield _getRegistry(data.registryEndpoint, data.registryAuth);
        const packageName = data.packageName;
        const packageVersion = data.packageVersion;
        const packagePrivate = data.private;
        const backwardsCompatible = data.backwardsCompatible;
        const devclass = data.devclass;
        const target = data.target;
        const releaseTimeout = data.releaseTimeout;
        const description = data.description;
        const git = data.git;
        const license = data.license;
        const keywords = _getKeywords(data.keywords);
        const authors = data.authors;
        const website = data.website;
        const readme = _getReadme(data.readme);
        const overwriteManifestValues = data.overwriteManifestValues;
        const customizingTransports = _getCustTransports(data.custTransports);
        const dependencies = _getDependencies(data.dependencies);
        const sapEntries = _getSapEntries(data.sapEntries);
        const skipDependencies = data.skipDependencies;
        const skipLang = data.skipLang;
        const tmpFolder = data.tmpFolder || __dirname;
        yield (0, trm_core_1.publish)({
            package: {
                name: packageName,
                version: packageVersion,
                private: packagePrivate,
                authors,
                backwardsCompatible,
                description,
                git,
                keywords,
                license,
                website,
                dependencies,
                sapEntries
            },
            registry,
            devclass,
            target,
            readme,
            skipDependencies,
            skipLang,
            overwriteManifestValues,
            releaseTimeout,
            customizingTransports,
            tmpFolder,
            silent: true
        });
    });
}
exports.publish = publish;
