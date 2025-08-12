import { type ObjectId } from './common';

type QuestionType = {
    _id?: ObjectId;
    question: string;
    topic: string;
    answer: {answer:string,explanation:string};
    recording_path: string;
    accuracy?:{
        totalAttempts:number;
        correctAttempts:number;
    };
    faq?:boolean;
}

export { type QuestionType };