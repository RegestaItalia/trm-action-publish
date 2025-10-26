import { context, getOctokit } from "@actions/github";
import { Login, PUBLIC_RESERVED_KEYWORD, PublishActionInput, PublishActionOutput, RESTSystemConnector, RFCSystemConnector, RegistryV2, SystemConnector, TrmManifestDependency, TrmManifestPostActivity, publish } from "trm-core";
import { readFileSync } from "fs";
import { Logger } from "trm-commons";

export type ActionArgs = {
    githubToken: string,
    systemLoginUser: string,
    systemLoginPassword: string,
    systemLoginLanguage: string,
    name: string,
    registryEndpoint: string,
    version: string,
    private: boolean,
    backwardsCompatible: boolean,
    keepLatestReleaseManifestValues: boolean,
    releaseTransportTimeout: number,
    noDependencyDetection: boolean,
    noLanguageTransport: boolean,
    releaseTransportTarget: string,
    systemRFCDest?: string,
    systemRFCAsHost?: string,
    systemRFCSysnr?: string,
    systemRFCSAPRouter?: string,
    systemRESTEndpoint?: string,
    systemRESTRfcDestination?: string,
    systemLoginClient?: string,
    registryToken?: string,
    registryAuth?: string,
    abapPackage?: string,
    shortDescription?: string,
    authors?: string,
    keywords?: string,
    git?: string,
    website?: string,
    license?: string,
    dependencies?: string,
    sapEntries?: string,
    postActivities?: string,
    readme?: string,
    customizingTransports?: string,
    test?: boolean
};

export async function publishWrapper(data: ActionArgs): Promise<PublishActionOutput> {
    //set system
    const systemLogin: Login = {
        client: data.systemLoginClient,
        user: data.systemLoginUser,
        passwd: data.systemLoginPassword,
        lang: data.systemLoginLanguage
    }
    if (data.systemRFCDest && data.systemRFCAsHost && data.systemRFCSysnr) {
        SystemConnector.systemConnector = new RFCSystemConnector({
            dest: data.systemRFCDest,
            ashost: data.systemRFCAsHost,
            sysnr: data.systemRFCSysnr,
            saprouter: data.systemRFCSAPRouter
        }, systemLogin);
    } else if (data.systemRESTEndpoint) {
        SystemConnector.systemConnector = new RESTSystemConnector({
            endpoint: data.systemRESTEndpoint,
            rfcdest: data.systemRESTRfcDestination
        }, systemLogin);
    } else {
        throw new Error(`No system connection defined: an RFC/REST connection must be provided.`);
    }
    await SystemConnector.connect();

    //get registry
    var registryAuth: any = {};
    if (data.registryToken) {
        registryAuth.token = data.registryToken;
    }
    if (data.registryAuth) {
        try {
            registryAuth = JSON.parse(data.registryAuth);
        } catch (e) {
            throw new Error(`Unable to parse registry authentication object: is input in JSON format?`);
        }
    }
    if (data.registryEndpoint.toLowerCase() === PUBLIC_RESERVED_KEYWORD) {
        data.registryEndpoint = PUBLIC_RESERVED_KEYWORD;
    }
    const registry = new RegistryV2(data.registryEndpoint, data.registryEndpoint);
    const ping = await registry.ping();
    if(ping.messages){
        ping.messages.forEach(o => Logger.registryResponse(o));
    }
    if (registryAuth) {
        Logger.loading(`Logging into "${data.registryEndpoint}" registry...`);
        await registry.authenticate(registryAuth);
        const whoami = await registry.whoAmI();
        Logger.success(`Logged in as ${whoami.user}`);
        if (whoami.messages) {
            whoami.messages.forEach(o => Logger.registryResponse(o));
        }
    }

    //get octokit
    const octokit = getOctokit(data.githubToken);

    //data parsing
    var dependencies: TrmManifestDependency[] = [];
    var sapEntries: any = {};
    var postActivities: TrmManifestPostActivity[] = [];
    if (!data.test) {
        Logger.loading(`Reading repository data...`);
        if (!data.shortDescription) {
            //defaults to the description of the repository running the action
            data.shortDescription = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    description
                }
            }`) as any).repository.description;
        }
        if (!data.authors) {
            //defaults to the authors in the repository running the action
            const gitAuthors: string[] = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    defaultBranchRef {
                        target {
                            ... on Commit {
                                history(first: 100) {
                                    nodes {
                                        author {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }`) as any).repository.defaultBranchRef?.target.history.nodes.map(node => node.author.name).filter((v, i, a) => a.indexOf(v) === i);
            if (gitAuthors.length > 0) {
                data.authors = gitAuthors.join(',');
            }
        }
        if (!data.keywords) {
            //defaults to the keywords in the repository running the action
            const gitKeywords: string[] = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    repositoryTopics(first: 10) {
                        edges {
                            node {
                                topic {
                                    name
                                }
                            }
                        }
                    }
                }
            }`) as any).repository.repositoryTopics.edges.map(edge => edge.node.topic.name);
            if (gitKeywords.length > 0) {
                data.keywords = gitKeywords.join(',');
            }
        }
        if (!data.git) {
            //defaults to the repository running the action
            data.git = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    url
                }
            }`) as any).repository.url;
            if (data.git) {
                data.git += ".git";
            }
        }
        if (!data.website) {
            //defaults to the website in the repository running the action
            data.website = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    homepageUrl
                }
            }`) as any).repository.homepageUrl;
        }
        if (!data.license) {
            //defaults to the license in the repository running the action
            data.license = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    licenseInfo {
                        spdxId
                    }
                }
            }`) as any).repository.licenseInfo?.spdxId;
        }
        if (data.readme) {
            //Path to the file or markup text
            try {
                data.readme = readFileSync(data.readme).toString();
            } catch (e) {
                //text is markup
            }
        } else {
            //defaults to repository README.md file content in root, if exists
            const workflowRun = (await octokit.rest.actions.getWorkflowRun({
                owner: context.repo.owner,
                repo: context.repo.repo,
                run_id: context.runId
            })).data;
            data.readme = (await octokit.graphql(`
            query {
                repository(owner: "${context.repo.owner}", name: "${context.repo.repo}") {
                    object(expression: "${workflowRun.head_branch}:README.md") {
                        ... on Blob {
                            text
                        }
                    }
                }
            }`) as any).repository.object?.text;
        }
    }
    if(data.dependencies){
        try{
            dependencies = JSON.parse(data.dependencies);
        }catch(e){
            Logger.error(e.toString(), true);
            Logger.error(`JSON parsing error on dependencies: publish will install ignoring dependencies.`);
        }
    }
    if(data.sapEntries){
        try{
            sapEntries = JSON.parse(data.sapEntries);
        }catch(e){
            Logger.error(e.toString(), true);
            Logger.error(`JSON parsing error on SAP entries: publish will install ignoring SAP entries.`);
        }
    }
    if(data.postActivities){
        try{
            postActivities = JSON.parse(data.postActivities);
        }catch(e){
            Logger.error(e.toString(), true);
            Logger.error(`JSON parsing error on post activities: publish will install ignoring post activities.`);
        }
    }
    try{
        const aAuthors = JSON.parse(data.authors);
        data.authors = aAuthors.join(',');
    }catch(e){
        //
    }
    try{
        const aKeywords = JSON.parse(data.keywords);
        data.keywords = aKeywords.join(',');
    }catch(e){
        //
    }
    const actionInput: PublishActionInput = {
        contextData: {
            noInquirer: true,
            logTemporaryFolder: process.cwd()
        },
        packageData: {
            name: data.name,
            version: data.version,
            devclass: data.abapPackage,
            manifest: {
                description: data.shortDescription,
                backwardsCompatible: data.backwardsCompatible,
                authors: data.authors,
                keywords: data.keywords,
                git: data.git,
                website: data.website,
                license: data.license,
                dependencies,
                sapEntries,
                postActivities
            },
            registry
        },
        systemData: {
            transportTarget: data.releaseTransportTarget,
            releaseTimeout: data.releaseTransportTimeout
        },
        publishData: {
            private: data.private,
            keepLatestReleaseManifestValues: data.keepLatestReleaseManifestValues,
            noDependenciesDetection: data.noDependencyDetection,
            noLanguageTransport: data.noLanguageTransport,
            customizingTransports: data.customizingTransports || undefined,
            skipCustomizingTransports: data.customizingTransports ? false : true,
            readme: data.readme
        }
    }
    return await publish(actionInput);
}