from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

COLLECTION_NAME = "career_kb"

client = QdrantClient(host="localhost", port=6333)
model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_and_store(docs):
    points = []
    for idx, doc in enumerate(docs):
        vector = model.encode(doc['text']).tolist()
        points.append(
            models.PointStruct(
                id=idx,
                vector=vector,
                payload=doc
            )
        )
    # Create or recreate collection with config if needed
    if COLLECTION_NAME not in [c.name for c in client.get_collections().collections]:
        client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=len(points[0].vector), distance=models.Distance.COSINE)
        )
    client.upsert(collection_name=COLLECTION_NAME, points=points)
