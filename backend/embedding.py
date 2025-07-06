from dotenv import load_dotenv
from pinecone import Pinecone
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI

load_dotenv("secrets.env")

pinecone_apikey = os.getenv("PINECONE")
openai_apikey = os.getenv("OPENAI")

pc = Pinecone(api_key=pinecone_apikey)
client = OpenAI(api_key=openai_apikey)


dense_idx  = pc.Index(host=os.getenv("DENSEHOST"))   
sparse_idx = pc.Index(host=os.getenv("SPARSEHOST"))    

def split_and_upsert(document, metadata):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=0)
    texts = text_splitter.split_text(document)

    uploads = []
    for c, text in enumerate(texts):
        p_id = 0
        if "page_number" in metadata:
            p_id = metadata["page_number"]
        elif "paragraph_number" in metadata:
            p_id = metadata["paragraph_number"]

        uploads.append({
            "_id": f'doc{metadata["doc_num"]}#p{p_id}#c{c}',
            "text": text,
            **metadata
        })
    
    # dense_idx.upsert_records("test", uploads)
    # sparse_idx.upsert_records("test", uploads)
    print(f"LOG: INSERTED {len(uploads)} RECORDS INTO PINECONE")




def retrieval(query, top_k=1, alpha=0.7):
    d_hits = dense_idx.search(
        namespace="test", 
        query={
            "inputs": {"text": query}, 
            "top_k": top_k
        },
        fields=None
    )['result']['hits']

    s_hits = dense_idx.search(
        namespace="test", 
        query={
            "inputs": {"text": query}, 
            "top_k": top_k
        },
        fields=None
    )['result']['hits']

    texts = {}

    scores = {}
    for h in d_hits:
        scores[h.id] = alpha * h.score
        texts[h.id] = h['fields']
    for h in s_hits:
        scores[h.id] = scores.get(h.id, 0) + (1-alpha) * h.score
        texts[h.id] = h['fields']

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return [texts[id] for id, _ in ranked]


def generation(query, ordered_search):
    """
    Use OpenAI generative model to answer the query using context from retrieved documents.
    Args:
        query (str): The user query
        ordered_search (list): List of retrieved document texts (context)
    Returns:
        str: Generated answer from the LLM
    """
    # Combine the context from the retrieved documents
    context = "\n\n".join([doc['text'] for doc in ordered_search])
    prompt = f"""
    Use the following context to answer the question.
    Context:
    {context}
    Question: {query}
    Answer:
    """
    response = client.ChatCompletion.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers questions based on provided context."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=512,
        temperature=0.2
    )
    print(response)
    return response["choices"][0]["message"]["content"].strip()


# text = '''
# Here are five recent works that explicitly marry retrieval‐augmented generation (RAG) with Text-to-SQL, each pairing an LLM with a retrieval layer for schema/examples and then executing the generated SQL:
# '''

# meta = {
#         "doc_num": 0,
#         "page_number": 0
#         }

# split_and_upsert(text, meta)

# search("RAG")


# {'result': {'hits': [{'_id': 'doc0#p0#c0',
#                       '_score': 0.20981590449810028,
#                       'fields': {'doc_num': 0.0,
#                                  'page_number': 0.0,
#                                  'text': 'Here are five recent works that '
#                                          'explicitly marry retrieval‐augmented '
#                                          'generation (RAG) with Text-to-SQL, '
#                                          'each pairing an LLM with a retrieval '
#                                          'layer for schema/examples and then '
#                                          'executing the generated SQL:'}}]},
#  'usage': {'embed_total_tokens': 5, 'read_units': 6}}
# {'result': {'hits': [{'_id': 'doc0#p0#c0',
#                       '_score': 0.20981590449810028,
#                       'fields': {'doc_num': 0.0,
#                                  'page_number': 0.0,
#                                  'text': 'Here are five recent works that '
#                                          'explicitly marry retrieval‐augmented '
#                                          'generation (RAG) with Text-to-SQL, '
#                                          'each pairing an LLM with a retrieval '
#                                          'layer for schema/examples and then '
#                                          'executing the generated SQL:'}}]},
#  'usage': {'embed_total_tokens': 5, 'read_units': 6}}