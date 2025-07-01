import { type ObjectId } from './common';

type QuestionType = {
    _id?: ObjectId;
    question: string;
    type: string;
    answer: {answer:string,explanation:string};
    recording_path: string;
}

export { type QuestionType };