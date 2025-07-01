from fastapi import FastAPI, File, UploadFile,Form
from fastapi.middleware.cors import CORSMiddleware
import io
from docx import Document
import pypandoc
from ai_opreation import parse_question
from db_opreation import upload_question_db
from typing import List
from pydantic import BaseModel

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # 允许的源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有头部
)

ACCESS_ID = "awhdbagydg2718dhdahdai!"

# 定义请求体模型
class UploadQuestionRequest(BaseModel):
    question_list: List[str]
    topic: str
    access_id: str

@app.post("/api/parse-question")
async def upload(file: UploadFile = File(...),access_id:str=Form(...)):
    if access_id != ACCESS_ID:
        return {"error": "Access denied"}
    
    contents = await file.read()

    # 如果是 .docx，用 python-docx 提取段落文字
    if file.filename.lower().endswith(".docx"):
        doc = Document(io.BytesIO(contents))
        text = "\n".join(p.text for p in doc.paragraphs)

    # 如果是 .pages，用 pypandoc（需安装 LibreOffice/pandoc）转换
    elif file.filename.lower().endswith(".pages"):
        tmp_path = f"/tmp/{file.filename}"
        with open(tmp_path, "wb") as f:
            f.write(contents)
        text = pypandoc.convert_file(tmp_path, "plain", format="pages")
    else:
        return {"error": "不支持的文件类型。"}
    
    question_list = parse_question(text)

    return {"question_list": question_list}


@app.post("/api/upload-question")
async def upload_question(request: UploadQuestionRequest):
    if request.access_id != ACCESS_ID:
        return {"error": "Access denied"}
    
    upload_question_db(request.question_list, request.topic)

    return {"message": "Question uploaded successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6432) 