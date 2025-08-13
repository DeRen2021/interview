// 导入基础配置
import { baseUrl, questionManagementBaseUrl } from './baseConfig';
// 导入API实例
import { mainApi, questionManagementApi } from './apiInstance';




// Topic 端点
const getAllQuestionTypesEndpoint = "api/topic/";

const getPrivateTopicEndpoint = "api/topic/private";


//问题端点
const getQuestionByTopicEndpoint = "api/questions/";

const getPrivateQuestionByTopicEndpoint = "api/questions/private/";



// 新增：问题管理端点
const parseFrqQuestionEndpoint = `${questionManagementBaseUrl}api/parse-frq-question`;

const uploadQuestionEndpoint = `${questionManagementBaseUrl}api/upload-question`;

const generateAnswerEndpoint = `${questionManagementBaseUrl}api/generate-answer`;

const generateExplanationEndpoint = `${questionManagementBaseUrl}api/generate-explanation`;

const updateQuestionEndpoint = `${questionManagementBaseUrl}api/update-question`;

// User Route
const userEndoint = `${baseUrl}api/users`;

const authUserEndpoint = `${userEndoint}/auth`;

const getUserProfileEndpoint = `${userEndoint}/profile`;

const updateUserNameEndpoint = `${userEndoint}/username`;

const updateUserLikedTopicsEndpoint = `${userEndoint}/liked-topics`;

const updateUserLikedQuestionsEndpoint = `${userEndoint}/liked-questions`;
const getUserLikedQuestionsEndpoint = `${userEndoint}/liked-questions`;

const updateQuestionFaqEndpoint = `${baseUrl}api/questions`;

// const updateQuestionAccuracyEndpoint = `${baseUrl}api/questions/:questionId/accuracy`;



// OpenAI endpoint
const transcribeEndpoint = `${baseUrl}api/openai/transcribe`;

const checkAnswerEndpoint = `${baseUrl}api/openai/comparison`;


export { 
    // API实例
    mainApi,
    questionManagementApi,
    
    // 基础URL
    baseUrl, 
    questionManagementBaseUrl,
    
    // 端点配置
    getQuestionByTopicEndpoint,
    getAllQuestionTypesEndpoint,
    getPrivateTopicEndpoint,
    getPrivateQuestionByTopicEndpoint,

    // admin管理端点
    parseFrqQuestionEndpoint,
    uploadQuestionEndpoint,
    generateAnswerEndpoint,
    generateExplanationEndpoint,
    updateQuestionEndpoint,

    // 用户端点
    userEndoint,
    authUserEndpoint,
    updateUserNameEndpoint,
    updateUserLikedTopicsEndpoint,
    updateUserLikedQuestionsEndpoint,
    updateQuestionFaqEndpoint,
    getUserLikedQuestionsEndpoint,
    getUserProfileEndpoint,
    transcribeEndpoint,
    checkAnswerEndpoint
};