// 从环境变量读取配置，如果没有设置则使用默认值
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/';

// 新增：问题解析和上传的后端URL (端口6432)
const questionManagementBaseUrl = import.meta.env.VITE_QUESTION_MANAGEMENT_BASE_URL || 'http://localhost:6432/';

const getQuestionByTypeEndpoint = "api/questions/";

const getAllQuestionTypesEndpoint = "api/questionType/";

// 新增：问题管理端点
const parseQuestionEndpoint = `${questionManagementBaseUrl}api/parse-question`;
const uploadQuestionEndpoint = `${questionManagementBaseUrl}api/upload-question`;

// User Route
const userEndoint = `${baseUrl}api/users`;

const authUserEndpoint = `${userEndoint}/auth`;

const updateUserNameEndpoint = `${userEndoint}/username`;

const updateUserLikedTopicsEndpoint = `${userEndoint}/liked-topics`;

const updateUserLikedQuestionsEndpoint = `${userEndoint}/liked-questions`;



// OpenAI endpoint
const transcribeEndpoint = `${baseUrl}api/openai/transcribe`;

const checkAnswerEndpoint = `${baseUrl}api/openai/comparison`;


export { baseUrl, 
    questionManagementBaseUrl,
    getQuestionByTypeEndpoint ,getAllQuestionTypesEndpoint,
    parseQuestionEndpoint,
    uploadQuestionEndpoint,
    userEndoint,
    authUserEndpoint,
    updateUserNameEndpoint,
    updateUserLikedTopicsEndpoint,
    updateUserLikedQuestionsEndpoint,

    transcribeEndpoint,
    checkAnswerEndpoint
};