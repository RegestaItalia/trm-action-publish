import { IInquirer, Question } from "trm-commons";
export declare class GithubInquirer implements IInquirer {
    constructor();
    prompt(arg1: Question | Question[]): Promise<any>;
    setPrefix(text: string): void;
    removePrefix(): void;
    getPrefix(): string;
}
