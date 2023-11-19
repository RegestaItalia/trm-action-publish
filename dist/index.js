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
(0, publish_1.publish)({
    githubToken: core.getInput('githubToken'),
    registryEndpoint: core.getInput('registryEndpoint'),
    registryAuth: core.getInput('registryAuth'),
    systemDest: core.getInput('systemDest'),
    systemAsHost: core.getInput('systemAsHost'),
    systemSysNr: core.getInput('systemSysNr'),
    systemSapRouter: core.getInput('systemSapRouter'),
    systemClient: core.getInput('systemClient'),
    systemLang: core.getInput('systemLang'),
    systemUser: core.getInput('systemUser'),
    systemPassword: core.getInput('systemPassword'),
    packageName: core.getInput('packageName'),
    packageVersion: core.getInput('packageVersion'),
    packageDescription: core.getInput('packageDescription'),
    packageGit: core.getInput('packageGit'),
    packageWebsite: core.getInput('packageWebsite'),
    packagePrivate: core.getBooleanInput('packagePrivate'),
    packageLicense: core.getInput('packageLicense'),
    packageKeywords: core.getInput('packageKeywords'),
    packageAuthors: core.getInput('packageAuthors'),
    packageBackwardsCompatible: core.getBooleanInput('packageBackwardsCompatible'),
    packageSapEntries: core.getInput('packageSapEntries'),
    packageDependencies: core.getInput('packageDependencies'),
    devclass: core.getInput('devclass'),
    target: core.getInput('target'),
    readme: core.getInput('readme'),
    releaseTimeout: parseInt(core.getInput('releaseTimeout')),
    skipDependencies: core.getBooleanInput('skipDependencies')
}).then(() => {
    console.log("Package published.");
}).catch(err => {
    core.setFailed(err.message);
});
