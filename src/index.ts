import * as core from "@actions/core";
import { publish } from "./publish";

publish({
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