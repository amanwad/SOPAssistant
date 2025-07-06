from langchain.chains import RetrievalQA
from langchain.llms import OpenAI  # or your preferred LLM
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings  # or your preferred embeddings
from langchain.prompts import PromptTemplate

import os
from dotenv import load_dotenv
load_dotenv("secrets.env")

pinecone_api_key = os.getenv("PINECONE")

# Set up Pinecone vector store
vectorstore = Pinecone(
    api_key=pinecone_api_key,
    index_name="your-index-name",  # replace with your index name
    embedding=OpenAIEmbeddings()
)

retriever = vectorstore.as_retriever()

# 2. Set up your LLM
llm = OpenAI(temperature=0)  # or your preferred LLM

# 3. Create a prompt template for RAG
prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template="""
    Use the following context to answer the question.
    Context: {context}
    Question: {question}
    Answer:"""
)

# 4. Create the RetrievalQA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": prompt_template}
)

# 5. Use the chain
def rag_pipeline(query):
    result = qa_chain({"query": query})
    return result["result"], result["source_documents"]

# Example usage:
if __name__ == "__main__":
    query = "What is the capital of France?"
    answer, docs = rag_pipeline(query)
    print("Answer:", answer)
    print("Source docs:", docs)