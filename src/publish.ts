import { AuthenticationType } from "trm-registry-types";
import { CoreEnv, Logger, Inquirer, Registry, SystemConnector, publish as trmPublish, TraceLevel, TrmManifestDependency } from "trm-core";
import { getOctokit, context as githubContext } from "@actions/github";
import { OctokitResponse } from "@octokit/types";
import * as fs from "fs";

export type ActionArgs = {
    githubToken?: string,
    registryEndpoint?: string,
    registryAuth?: string,
    systemDest: string,
    systemAsHost: string,
    systemSysNr: string,
    systemSapRouter?: string,
    systemClient: string,
    systemLang: string,
    systemUser: string,
    systemPassword: string,
    packageName: string,
    packageVersion?: string,
    packageDescription?: string,
    packageGit?: string,
    packageWebsite?: string,
    packagePrivate: boolean,
    packageLicense?: string,
    packageKeywords?: string,
    packageAuthors?: string,
    packageBackwardsCompatible: boolean,
    packageSapEntries?: string,
    packageDependencies?: string,
    devclass: string,
    target: string,
    readme?: string,
    skipDependencies: boolean,
    skipTrLang: boolean,
    releaseTimeout: number
};

export async function publish(data: ActionArgs) {
    const githubToken = data.githubToken;
    var repoData: OctokitResponse<any>;
    var octokit: any;
    if (githubToken) {
        octokit = getOctokit(githubToken);
        repoData = await octokit.request('GET /repos/{owner}/{repo}', {
            owner: githubContext.repo.owner,
            repo: githubContext.repo.repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
    }
    const registryEndpoint = data.registryEndpoint || 'public';
    const registryAuth = data.registryAuth ? JSON.parse(data.registryAuth) : undefined;
    const logger = new Logger(CoreEnv.CLI, TraceLevel.TRACE_ALL);
    const inquirer = new Inquirer(CoreEnv.DUMMY);
    const oRegistry = new Registry(registryEndpoint, registryEndpoint);

    const devclass = data.devclass.trim().toUpperCase();
    const target = data.target.trim().toUpperCase();
    var packageName = data.packageName;
    var description = data.packageDescription;
    var git = data.packageGit;
    var website = data.packageWebsite;
    var license = data.packageLicense;
    var keywords: string | string[] = data.packageKeywords;
    var authors: string | string[] = data.packageAuthors;
    var sapEntries: any = data.packageSapEntries;
    var dependencies: any = data.packageDependencies;
    var readme = data.readme;
    if (!packageName) {
        if (repoData) {
            packageName = repoData.data.name;
            logger.info(`"packageName" from Github repository -> "${packageName}"`);
        } else {
            throw new Error(`Argument "packageName" not provided.`);
        }
    }
    if (sapEntries) {
        var sSapEntries: string;
        try {
            sSapEntries = fs.readFileSync(sapEntries).toString();
        } catch (e) {
            sSapEntries = sapEntries;
        }
        sapEntries = JSON.parse(sSapEntries);
    } else {
        sapEntries = {};
    }
    if (dependencies) {
        var sDependencies: string;
        if (dependencies.trim()[0] === '[') {
            sDependencies = dependencies;
        } else {
            sDependencies = fs.readFileSync(dependencies).toString();
        }
        dependencies = JSON.parse(sDependencies);
    } else {
        dependencies = [];
    }
    if (!description) {
        if (repoData) {
            description = repoData.data.description;
            logger.info(`"description" from Github repository -> "${description}"`);
        }
    }
    if (!git) {
        if (repoData) {
            git = repoData.data.git_url;
            logger.info(`"git" from Github repository -> "${git}"`);
        }
    }
    if (!website) {
        if (repoData) {
            website = repoData.data.homepage;
            logger.info(`"website" from Github repository -> "${website}"`);
        }
    }
    if (!license) {
        if (repoData) {
            if (repoData.data.license && repoData.data.license.spdx_id) {
                license = repoData.data.license.spdx_id;
                logger.info(`"license" from Github repository -> "${license}"`);
            }
        }
    }
    if (!keywords) {
        if (repoData) {
            keywords = repoData.data.topics;
            logger.info(`"keywords" from Github repository -> [${(keywords as string[]).join(', ')}]`);
        }
    } else {
        var aKeywords = keywords.split(',');
        aKeywords.forEach(k => {
            k = k.trim();
        });
        keywords = aKeywords;
    }
    if (!authors) {
        if (octokit) {
            var fetchContributors = true;
            var iPage = 0;
            var aContributors: any[] = [];
            while (fetchContributors) {
                iPage++;
                const tmpContributors = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
                    owner: githubContext.repo.owner,
                    repo: githubContext.repo.repo,
                    per_page: 100,
                    page: iPage,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                aContributors = aContributors.concat(tmpContributors.data);
                fetchContributors = tmpContributors.data.length > 0;
            }
            authors = aContributors.map(o => o.login);
            logger.info(`"authors" from Github repository -> [${authors.join(', ')}]`);
        }
    } else {
        var aAuthors = authors.split(',');
        aAuthors.forEach(a => {
            a = a.trim();
        });
        authors = aAuthors;
    }
    if (readme) {
        var sReadme: string;
        try {
            sReadme = fs.readFileSync(readme).toString();
        } catch (e) {
            sReadme = readme;
        }
        readme = sReadme;
    }

    const registryPing = await oRegistry.ping();
    if (registryPing.wallMessage) {
        logger.registryResponse(registryPing.wallMessage);
    }
    if (registryAuth && registryPing.authenticationType !== AuthenticationType.NO_AUTH) {
        logger.loading(`Logging into registry...`);
        await oRegistry.authenticate(inquirer, logger, registryAuth);
        const whoami = await oRegistry.whoAmI();
        logger.success(`Logged in as "${whoami.username}"`);
    }
    const oSystem = new SystemConnector({
        dest: data.systemDest,
        ashost: data.systemAsHost,
        sysnr: data.systemSysNr,
        saprouter: data.systemSapRouter
    }, {
        client: data.systemClient,
        lang: data.systemLang,
        user: data.systemUser,
        passwd: data.systemPassword
    }, logger);
    await oSystem.connect();
    await trmPublish({
        package: {
            name: packageName,
            version: data.packageVersion || 'latest',
            description,
            git,
            website,
            private: data.packagePrivate || false,
            license,
            keywords,
            authors: authors ? (authors as string[]).map(s => {
                return {
                    name: s
                }
            }) : [],
            backwardsCompatible: data.packageBackwardsCompatible || false,
            sapEntries: sapEntries,
            dependencies: (dependencies as TrmManifestDependency[])
        },
        devclass,
        target,
        readme,
        releaseTimeout: data.releaseTimeout,
        ci: true,
        tmpFolder: __dirname,
        skipDependencies: data.skipDependencies,
        skipLang: data.skipTrLang
    }, inquirer, oSystem, oRegistry, logger);
}