import { getBooleanInput, getInput, isDebug, setFailed } from "@actions/core";
import { ActionArgs, publishWrapper } from "./publishWrapper";
import { GithubLogger } from "./GithubLogger";
import { Inquirer, Logger, PublishActionOutput } from "trm-core";
import { GithubInquirer } from "./GithubInquirer";

const main = async(data: ActionArgs): Promise<PublishActionOutput> => {
    //set logger
    Logger.logger = new GithubLogger(isDebug());

    //set inquirer
    Inquirer.inquirer = new GithubInquirer();

    return await publishWrapper(data);
}

const sReleaseTransportTimeout = getInput("releaseTransportTimeout", { required: true, trimWhitespace: true });
var releaseTransportTimeout: number;
try{
    if(sReleaseTransportTimeout){
        releaseTransportTimeout = parseInt(sReleaseTransportTimeout);
    }
}catch(e){
    setFailed(`Invalid release timeout value: "${sReleaseTransportTimeout}", expected seconds.`);
}
main({
    systemLoginUser: getInput("systemLoginUser", { required: true, trimWhitespace: true }),
    systemLoginPassword: getInput("systemLoginPassword", { required: true, trimWhitespace: true }),
    systemLoginLanguage: getInput("systemLoginLanguage", { required: true, trimWhitespace: true }),
    name: getInput("name", { required: true, trimWhitespace: true }),
    registryEndpoint: getInput("registryEndpoint", { required: true, trimWhitespace: true }),
    version: getInput("version", { required: true, trimWhitespace: true }),
    private: getBooleanInput("private", { required: true, trimWhitespace: true }),
    backwardsCompatible: getBooleanInput("backwardsCompatible", { required: true, trimWhitespace: true }),
    keepLatestReleaseManifestValues: getBooleanInput("keepLatestReleaseManifestValues", { required: true, trimWhitespace: true }),
    releaseTransportTimeout: releaseTransportTimeout,
    noDependencyDetection: getBooleanInput("noDependencyDetection", { required: true, trimWhitespace: true }),
    noLanguageTransport: getBooleanInput("noLanguageTransport", { required: true, trimWhitespace: true }),
    githubToken: getInput("githubToken", { required: false, trimWhitespace: true }),
    systemRFCDest: getInput("systemRFCDest", { required: false, trimWhitespace: true }),
    systemRFCAsHost: getInput("systemRFCAsHost", { required: false, trimWhitespace: true }),
    systemRFCSysnr: getInput("systemRFCSysnr", { required: false, trimWhitespace: true }),
    systemRFCSAPRouter: getInput("systemRFCSAPRouter", { required: false, trimWhitespace: true }),
    systemRESTEndpoint: getInput("systemRESTEndpoint", { required: false, trimWhitespace: true }),
    systemRESTRfcDestination: getInput("systemRESTRfcDestination", { required: false, trimWhitespace: true }),
    systemLoginClient: getInput("systemLoginClient", { required: false, trimWhitespace: true }),
    registryToken: getInput("registryToken", { required: false, trimWhitespace: true }),
    registryAuth: getInput("registryAuth", { required: false, trimWhitespace: true }),
    abapPackage: getInput("abapPackage", { required: false, trimWhitespace: true }),
    shortDescription: getInput("shortDescription", { required: false, trimWhitespace: true }),
    authors: getInput("authors", { required: false, trimWhitespace: true }),
    keywords: getInput("keywords", { required: false, trimWhitespace: true }),
    git: getInput("git", { required: false, trimWhitespace: true }),
    website: getInput("website", { required: false, trimWhitespace: true }),
    license: getInput("license", { required: false, trimWhitespace: true }),
    dependencies: getInput("dependencies", { required: false, trimWhitespace: true }),
    sapEntries: getInput("sapEntries", { required: false, trimWhitespace: true }),
    readme: getInput("readme", { required: false, trimWhitespace: true }),
    releaseTransportTarget: getInput("releaseTransportTarget", { required: true, trimWhitespace: true }),
    customizingTransports: getInput("customizingTransports", { required: false, trimWhitespace: true })
}).then(result => {
    Logger.success(`+ ${result.trmPackage.packageName}`);
}).catch(e => {
    setFailed(e);
});