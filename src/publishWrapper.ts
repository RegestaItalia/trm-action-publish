import { context, getOctokit } from "@actions/github";
import { Logger, Login, PUBLIC_RESERVED_KEYWORD, PublishActionInput, PublishActionOutput, RESTSystemConnector, RFCSystemConnector, Registry, SystemConnector, TrmManifestDependency, publish } from "trm-core";
import { readFileSync } from "fs";

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
    readme?: string,
    customizingTransports?: string
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
    const registry = new Registry(data.registryEndpoint, data.registryEndpoint);
    if (registryAuth) {
        Logger.loading(`Logging into "${data.registryEndpoint}" registry...`);
        await registry.authenticate(registryAuth);
        const whoami = await registry.whoAmI();
        Logger.success(`Logged in as ${whoami.username}`);
        if (whoami.logonMessage) {
            Logger.registryResponse(whoami.logonMessage);
        }
    }

    //get octokit
    const octokit = getOctokit(data.githubToken);

    //data parsing
    var dependencies: TrmManifestDependency[] = [];
    var sapEntries: any = {};
    Logger.loading(`Reading repository data...`);
    if(!data.shortDescription){
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
        if(data.git){
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
        try{
            data.readme = readFileSync(data.readme).toString();
        }catch(e){
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
                sapEntries
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