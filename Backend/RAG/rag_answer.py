from RAG.embed_store import embed_texts
from huggingface_hub import InferenceClient
from openai import OpenAI


def retrieve(query: str, index, chunks: list, top_k: int = 5, embedding_model: str = None) -> list:
    """Retrieve top-k relevant chunks for a query."""
    if not embedding_model:
        raise ValueError("Embedding model is required for retrieval")
    
    qvector = embed_texts([query], model_name=embedding_model)
    _, indices = index.search(qvector, top_k)
    return [chunks[i] for i in indices[0] if i != -1]


def generate_answer(query: str, ctx: list, provider: str, llm_model: str, api_key: str) -> str:
    """Generate answer using specified LLM provider."""
    if not provider or provider not in ["huggingface", "openai"]:
        raise ValueError("Provider must be 'huggingface' or 'openai'")
    if not llm_model:
        raise ValueError("LLM model name is required")
    if not api_key:
        raise ValueError("API key is required")
    
    context = "\n".join(ctx)
    system_prompt = "You are a helpful assistant. Answer concisely using only the provided context."
    user_prompt = f"Context: {context}\n\nQuestion: {query}\n\nAnswer:"
    
    try:
        if provider == "openai":
            return _generate_openai(system_prompt, user_prompt, llm_model, api_key)
        return _generate_huggingface(system_prompt, user_prompt, llm_model, api_key)
    except Exception as e:
        error_msg = str(e).lower()
        if "rate limit" in error_msg:
            raise Exception("Rate limit exceeded. Try again later.")
        elif "model" in error_msg:
            raise Exception(f"Model error: {e}")
        raise Exception(f"Failed to generate answer: {e}")


def _generate_huggingface(system_prompt: str, user_prompt: str, model: str, api_key: str) -> str:
    """Generate using HuggingFace Inference API."""
    client = InferenceClient(token=api_key)
    response = client.chat_completion(
        model=model,
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        max_tokens=500,
        temperature=0.2
    )
    return response.choices[0].message.content.strip()


def _generate_openai(system_prompt: str, user_prompt: str, model: str, api_key: str) -> str:
    """Generate using OpenAI API."""
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        max_tokens=500,
        temperature=0.2
    )
    return response.choices[0].message.content.strip()