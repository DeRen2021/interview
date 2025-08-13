import { type ObjectId } from './common';


export interface UserDocument{
    _id?: ObjectId;
    // username: string;
    email: string;
    password: string;
    likedTopics: ObjectId[];
    likedQuestions: ObjectId[];
    role?: string;
    token?: string; // JWT token
}