# pyrefly: ignore [missing-import]
from typing import TypedDict, Annotated, List, Dict
from langgraph.graph import StateGraph, END
from app.ocr.paddle_service import paddle_service
from app.services.chunk_service import chunk_service
from app.services.chroma_service import chroma_service
from app.services.retrieval_service import retrieval_service
from app.services.groq_service import groq_service
from app.utils.logger import logger

class AgentState(TypedDict):
    file_path: str
    ocr_text: str
    chunks: List[str]
    context: str
    query: str
    response: str
    history: List[Dict[str, str]]

# Nodes
def ocr_node(state: AgentState):
    logger.info("Starting OCR Node")
    text = paddle_service.extract_text(state["file_path"])
    return {"ocr_text": text}

def chunk_node(state: AgentState):
    logger.info("Starting Chunk Node")
    chunks = chunk_service.split_text(state["ocr_text"])
    return {"chunks": chunks}

def embedding_node(state: AgentState):
    logger.info("Starting Embedding Node")
    doc_id = state.get("file_path", "unknown").split("/")[-1]
    metadatas = [{"doc_id": doc_id} for _ in state["chunks"]]
    ids = [f"{doc_id}_{i}" for i in range(len(state["chunks"]))]
    chroma_service.add_chunks(state["chunks"], ids, metadatas)
    return {}

def retriever_node(state: AgentState):
    logger.info("Starting Retriever Node")
    context = retrieval_service.get_context(state["query"])
    return {"context": context}

def conversation_node(state: AgentState):
    logger.info("Starting Conversation Node")
    system_prompt = f"Use the following context to answer the user query: {state['context']}"
    messages = [
        {"role": "system", "content": system_prompt},
        *state["history"],
        {"role": "user", "content": state["query"]}
    ]
    response = groq_service.chat_completion(messages)
    return {"response": response}

# Define Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("ocr", ocr_node)
workflow.add_node("chunk", chunk_node)
workflow.add_node("embedding", embedding_node)
workflow.add_node("retriever", retriever_node)
workflow.add_node("conversation", conversation_node)

# Build Edges
workflow.set_entry_point("ocr")
workflow.add_edge("ocr", "chunk")
workflow.add_edge("chunk", "embedding")
workflow.add_edge("embedding", "retriever")
workflow.add_edge("retriever", "conversation")
workflow.add_edge("conversation", END)

graph_app = workflow.compile()
