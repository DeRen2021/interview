import { type ObjectId } from './common';


export interface UserDocument{
    _id?: ObjectId;
    username?: string; // 数据库中可能没有此字段，设为可选
    email: string;
    password: string;
    likedTopics: ObjectId[];
    likedQuestions: ObjectId[];
    role?: string;
    token?: string; // JWT token
}