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
const trm_registry_types_1 = require("trm-registry-types");
const trm_core_1 = require("trm-core");
const github_1 = require("@actions/github");
const fs = __importStar(require("fs"));
function publish(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const githubToken = data.githubToken;
        var repoData;
        var octokit;
        if (githubToken) {
            octokit = (0, github_1.getOctokit)(githubToken);
            repoData = yield octokit.request('GET /repos/{owner}/{repo}', {
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
        }
        const registryEndpoint = data.registryEndpoint || 'public';
        const registryAuth = data.registryAuth ? JSON.parse(data.registryAuth) : undefined;
        const logger = new trm_core_1.Logger(trm_core_1.CoreEnv.CLI, trm_core_1.TraceLevel.TRACE_ALL);
        const inquirer = new trm_core_1.Inquirer(trm_core_1.CoreEnv.DUMMY);
        const oRegistry = new trm_core_1.Registry(registryEndpoint, registryEndpoint);
        const devclass = data.devclass.trim().toUpperCase();
        const target = data.target.trim().toUpperCase();
        var packageName = data.packageName;
        var description = data.packageDescription;
        var git = data.packageGit;
        var website = data.packageWebsite;
        var license = data.packageLicense;
        var keywords = data.packageKeywords;
        var authors = data.packageAuthors;
        var sapEntries = data.packageSapEntries;
        var dependencies = data.packageDependencies;
        var readme = data.readme;
        if (!packageName) {
            if (repoData) {
                packageName = repoData.data.name;
                logger.info(`"packageName" from Github repository -> "${packageName}"`);
            }
            else {
                throw new Error(`Argument "packageName" not provided.`);
            }
        }
        if (sapEntries) {
            var sSapEntries;
            try {
                sSapEntries = fs.readFileSync(sapEntries).toString();
            }
            catch (e) {
                sSapEntries = sapEntries;
            }
            sapEntries = JSON.parse(sSapEntries);
        }
        else {
            sapEntries = {};
        }
        if (dependencies) {
            var sDependencies;
            if (dependencies.trim()[0] === '[') {
                sDependencies = dependencies;
            }
            else {
                sDependencies = fs.readFileSync(dependencies).toString();
            }
            dependencies = JSON.parse(sDependencies);
        }
        else {
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
                logger.info(`"keywords" from Github repository -> [${keywords.join(', ')}]`);
            }
        }
        else {
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
                var aContributors = [];
                while (fetchContributors) {
                    iPage++;
                    const tmpContributors = yield octokit.request('GET /repos/{owner}/{repo}/contributors', {
                        owner: github_1.context.repo.owner,
                        repo: github_1.context.repo.repo,
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
        }
        else {
            var aAuthors = authors.split(',');
            aAuthors.forEach(a => {
                a = a.trim();
            });
            authors = aAuthors;
        }
        if (readme) {
            var sReadme;
            try {
                sReadme = fs.readFileSync(readme).toString();
            }
            catch (e) {
                sReadme = readme;
            }
            readme = sReadme;
        }
        const registryPing = yield oRegistry.ping();
        if (registryPing.wallMessage) {
            logger.registryResponse(registryPing.wallMessage);
        }
        if (registryAuth && registryPing.authenticationType !== trm_registry_types_1.AuthenticationType.NO_AUTH) {
            logger.loading(`Logging into registry...`);
            yield oRegistry.authenticate(inquirer, logger, registryAuth);
            const whoami = yield oRegistry.whoAmI();
            logger.success(`Logged in as "${whoami.username}"`);
        }
        const oSystem = new trm_core_1.SystemConnector({
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
        yield oSystem.connect();
        yield (0, trm_core_1.publish)({
            package: {
                name: packageName,
                version: data.packageVersion || 'latest',
                description,
                git,
                website,
                private: data.packagePrivate || false,
                license,
                keywords,
                authors: authors ? authors.map(s => {
                    return {
                        name: s
                    };
                }) : [],
                backwardsCompatible: data.packageBackwardsCompatible || false,
                sapEntries: sapEntries,
                dependencies: dependencies
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
    });
}
exports.publish = publish;
