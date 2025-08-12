import React, { useState } from 'react';
import { checkAnswerEndpoint, mainApi } from '../../config/config';
import { type QuestionType } from '../../type/question.type';
import '../../styles/component/Button.css';
import { type audioResponse } from '../../type/openai.type';
import { handleApiError } from '../../config/apiInstance';

interface CheckAnswerButtonProps {
    question: QuestionType;
    answer: string;
    onResult: (passed: boolean, feedback: string) => void;
}

export default function CheckAnswerButton({ question, answer, onResult }: CheckAnswerButtonProps) {
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckAnswer = async () => {
        if (!question || !answer) {
            alert("请先录音回答问题");
            return;
        };

        setIsChecking(true);
        try {
            const response = await mainApi.post(checkAnswerEndpoint, {
                question: question.question,
                answer: answer,
                questionId: question._id
            });
            if (response.status === 200) {
                const data: audioResponse = response.data;
                onResult(data.passed, data.feedback);
            }
        } catch (error) {
            console.error('检查答案失败:', error);
            const errorMessage = handleApiError(error);
            onResult(false, `检查答案失败：${errorMessage}`);
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <button onClick={handleCheckAnswer} className="button" disabled={isChecking}>
            {isChecking ? '正在检查...' : '检查答案'}
        </button>
    )
}
