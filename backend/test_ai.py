# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
import chromadb
import os

print("Testing Embeddings & ChromaDB...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embedding = model.encode(["test sentence"]).tolist()
    print("Embeddings generated successfully!")
    
    client = chromadb.PersistentClient(path="chroma_db")
    collection = client.get_or_create_collection(name="test_collection")
    collection.add(ids=["1"], embeddings=embedding, documents=["test sentence"])
    print("ChromaDB persistent storage working!")
except Exception as e:
    print(f"Error: {e}")
