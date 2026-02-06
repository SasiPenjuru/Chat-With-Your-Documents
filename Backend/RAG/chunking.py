import tiktoken


def chunk_text(text: str, max_chunk_size: int = 500, overlap_size: int = 80) -> list:
    """Split text into overlapping chunks by token count."""
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    
    chunks = []
    start = 0
    
    while start < len(tokens):
        end = min(start + max_chunk_size, len(tokens))
        chunks.append(encoding.decode(tokens[start:end]))
        start += max_chunk_size - overlap_size
    
    return chunks