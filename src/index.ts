import * as core from "@actions/core";
import { publish } from "./publish";

var releaseTimeout: number;
try{
    releaseTimeout = parseInt(core.getInput('releaseTimeout'));
}catch(e){
    core.setFailed(`Invalid release timeout value.`);
}
publish({
    systemDest: core.getInput('systemDest'),
    systemAsHost: core.getInput('systemAsHost'),
    systemSysnr: core.getInput('systemSysnr'),
    systemSapRouter: core.getInput('systemSapRouter'),
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