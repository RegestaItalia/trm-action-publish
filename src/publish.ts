import { CliInquirer, ConsoleLogger, Inquirer, Logger, Registry, ServerSystemConnector, SystemConnector, TrmManifestDependency, publish as action } from "trm-core";
import * as core from "@actions/core";
import * as fs from "fs";
import { GithubLogger } from "./GithubLogger";

export type ActionArgs = {
    systemDest: string,
    systemAsHost: string,
    systemSysnr: string,
    systemSapRouter?: string,
    systemClient: string,
    systemUser: string,
    systemPassword: string,
    systemLang: string,
    devclass: string,
    target: string,
    registryEndpoint: string,
    packageName: string,
    packageVersion: string,
    releaseTimeout: number,
    overwriteManifestValues: boolean,
    skipDependencies: boolean,
    skipLang: boolean,
    backwardsCompatible: boolean,
    simpleLog: boolean,
    description?: string,
    private?: boolean,
    git?: string,
    website?: string,
    license?: string,
    authors?: string,
    keywords?: string,
    readme?: string,
    custTransports?: string,
    dependencies?: string,
    sapEntries?: string,
    registryAuth?: string,
    tmpFolder?: string
};

const _getRegistry = async (endpoint: string, auth?: string): Promise<Registry> => {
    const registry = new Registry(endpoint);
    if(auth){
        var oAuth: any;
        try{
            oAuth = JSON.parse(auth);
        }catch(e){
            throw new Error(`Invalid registry authentication data.`);
        }
        Logger.loading(`Logging into registry...`);
        await registry.authenticate(oAuth);
        const whoami = await registry.whoAmI();
        const ping = await registry.ping();
        Logger.success(`Logged in as "${whoami.username}"`);
        if(ping.wallMessage){
            Logger.registryResponse(ping.wallMessage);
        }
    }
    return registry;
}

const _getReadme = (iReadme: string): string => {
    if(iReadme){
        try{
            return fs.readFileSync(iReadme).toString();
        }catch(e){
            return iReadme;
        }
    }
}

const _getCustTransports = (iCustTransports: string): string[] => {
    var customizingTransports;
    try{
        customizingTransports = iCustTransports.split(',');
    }catch(e){
        customizingTransports = [];
    }
    return customizingTransports;
}

const _getDependencies = (iDependencies: string): TrmManifestDependency[] => {
    var dependencies;
    try{
        dependencies = JSON.parse(iDependencies).map(o => {
            return {
                name: o.name,
                version: o.version,
                integrity: o.integrity,
                registry: o.registry
            }
        });
    }catch(e){
        dependencies = [];
    }
    dependencies.forEach(o => {
        if(!o.name){
            throw new Error(`Package dependencies input: missing dependency name.`);
        }
        if(!o.version){
            throw new Error(`Package dependencies input: missing dependency version.`);
        }
        if(!o.integrity){
            throw new Error(`Package dependencies input: missing dependency integrity.`);
        }
    });
    return dependencies;
}

const _getSapEntries = (iSapEntries: string): any => {
    var sapEntries;
    try{
        sapEntries = JSON.parse(iSapEntries);
        if(Array.isArray(sapEntries)){
            throw new Error(`SAP Entries input: invalid JSON.`);
        }
    }catch(e){
        sapEntries = {};
    }
    Object.keys(sapEntries).forEach(k => {
        if(!Array.isArray(sapEntries[k])){
            throw new Error(`SAP Entries input: invalid JSON.`);
        }
        sapEntries[k].forEach(o => {
            if(!Array.isArray(o)){
                throw new Error(`SAP Entries input: invalid JSON.`);
            }
            if(Object.keys(o).length === 0){
                throw new Error(`SAP Entries input: invalid JSON.`);
            }
        });
    });
    return sapEntries;
}

export async function publish(data: ActionArgs) {
    const debug = core.isDebug();
    if(data.simpleLog){
        Logger.logger = new ConsoleLogger(debug);
    }else{
        Logger.logger = new GithubLogger(debug);
    }
    Inquirer.inquirer = new CliInquirer(); //TODO: dummy inquirer that throws error is needs user interaction
    SystemConnector.systemConnector = new ServerSystemConnector({
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

    //connections
    await SystemConnector.connect();
    const registry = await _getRegistry(data.registryEndpoint, data.registryAuth);

    //data parsing
    const packageName = data.packageName;
    const packageVersion = data.packageVersion;
    const packagePrivate = data.private;
    const authors = data.authors;
    const backwardsCompatible = data.backwardsCompatible;
    const devclass = data.devclass;
    const target = data.target;
    const releaseTimeout = data.releaseTimeout;
    const description = data.description;
    const git = data.git;
    const license = data.license;
    const keywords = data.keywords;
    const website = data.website;
    const readme = _getReadme(data.readme);
    const overwriteManifestValues = data.overwriteManifestValues;
    const customizingTransports = _getCustTransports(data.custTransports);
    const dependencies = _getDependencies(data.dependencies);
    const sapEntries = _getSapEntries(data.sapEntries);
    const skipDependencies = data.skipDependencies;
    const skipLang = data.skipLang;
    const tmpFolder = data.tmpFolder || __dirname;
    await action({
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
}