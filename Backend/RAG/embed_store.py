import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

_embedding_models = {}  # Cache for loaded models


def get_embedding_model(model_name: str):
    """Load and cache embedding model."""
    if not model_name:
        raise ValueError("Embedding model name is required")
    
    if model_name not in _embedding_models:
        _embedding_models[model_name] = SentenceTransformer(model_name)
    
    return _embedding_models[model_name]


def embed_texts(texts: list, model_name: str) -> np.ndarray:
    """Generate normalized embeddings for texts."""
    if not model_name:
        raise ValueError("Embedding model name is required")
    
    model = get_embedding_model(model_name)
    vectors = model.encode(texts, convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(vectors)
    return vectors