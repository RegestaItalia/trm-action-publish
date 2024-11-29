import { IInquirer, Question } from "trm-core";

export class GithubInquirer implements IInquirer {

    constructor() { }

    public async prompt(arg1: Question | Question[]): Promise<any> {
        return {};
    }

    public setPrefix(text: string): void { }

    public removePrefix(): void { }

    public getPrefix(): string {
        return null;
    }
    
}