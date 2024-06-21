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
const core = __importStar(require("@actions/core"));
const publish_1 = require("./publish");
var releaseTimeout;
try {
    releaseTimeout = parseInt(core.getInput('releaseTimeout'));
}
catch (e) {
    core.setFailed(`Invalid release timeout value.`);
}
(0, publish_1.publish)({
    systemDest: core.getInput('systemDest'),
    systemAsHost: core.getInput('systemAsHost'),
    systemSysnr: core.getInput('systemSysnr'),
    systemClient: core.getInput('systemClient'),
    systemUser: core.getInput('systemUser'),
    systemPassword: core.getInput('systemPassword'),
    systemLang: core.getInput('systemLang'),
    devclass: core.getInput('devclass'),
    target: core.getInput('target'),
    registryEndpoint: core.getInput('registryEndpoint'),
    packageName: core.getInput('packageName'),
    packageVersion: core.getInput('packageVersion'),
    releaseTimeout,
    overwriteManifestValues: core.getBooleanInput('overwriteManifestValues'),
    skipDependencies: core.getBooleanInput('skipDependencies'),
    skipLang: core.getBooleanInput('skipLang'),
    backwardsCompatible: core.getBooleanInput('backwardsCompatible'),
    simpleLog: core.getBooleanInput('simpleLog'),
    description: core.getInput('description'),
    private: core.getBooleanInput('private'),
    git: core.getInput('git'),
    website: core.getInput('website'),
    license: core.getInput('license'),
    authors: core.getInput('authors'),
    keywords: core.getInput('keywords'),
    readme: core.getInput('readme'),
    custTransports: core.getInput('custTransports'),
    dependencies: core.getInput('dependencies'),
    sapEntries: core.getInput('sapEntries'),
    registryAuth: core.getInput('registryAuth'),
    tmpFolder: core.getInput('tmpFolder'),
}).then(() => {
    console.log("Package published.");
}).catch(err => {
    core.setFailed(err.message);
});
