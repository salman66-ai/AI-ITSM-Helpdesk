from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


print("Loading embedding model...")
embedding_model = SentenceTransformer(MODEL_NAME)
print("Embedding model loaded.")


documents = []
index = None


def load_documents():
    global documents

    documents = []

    for file_path in KNOWLEDGE_BASE_DIR.glob("*.txt"):

        text = file_path.read_text(encoding="utf-8").strip()

        # Split document into logical sections.
        # A section starts at a heading and continues until
        # the next heading/section.
        lines = text.splitlines()

        current_section = []

        for line in lines:

            line = line.strip()

            if not line:
                continue

            # Ignore simple document title
            if (
                not current_section
                and (
                    line.startswith("Title:")
                    or line.endswith("Guide")
                    or line.endswith("Troubleshooting")
                )
            ):
                current_section.append(line)
                continue

            # Section headings
            section_headers = [
                "Issue:",
                "Troubleshooting Steps:",
                "Automatable Actions:",
                "Automation Safety:",
                "Escalation:",
            ]

            if line in section_headers:

                if current_section:
                    documents.append({
                        "text": "\n".join(current_section),
                        "source": file_path.name
                    })

                current_section = [line]

            else:
                current_section.append(line)

        # Save final section
        if current_section:
            documents.append({
                "text": "\n".join(current_section),
                "source": file_path.name
            })

    print(f"Loaded {len(documents)} knowledge chunks.")


def create_vector_index():

    global index

    if not documents:
        load_documents()

    texts = [
        document["text"]
        for document in documents
    ]

    embeddings = embedding_model.encode(
        texts,
        convert_to_numpy=True
    )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(
        embeddings.astype("float32")
    )

    print(
        f"FAISS index created with {len(documents)} chunks."
    )


def search_knowledge(
    query: str,
    top_k: int = 3
):

    global index

    if index is None:
        create_vector_index()

    query_embedding = embedding_model.encode(
        [query],
        convert_to_numpy=True
    )

    distances, indices = index.search(
        query_embedding.astype("float32"),
        min(top_k, len(documents))
    )

    results = []

    for distance, idx in zip(
        distances[0],
        indices[0]
    ):

        if idx < 0:
            continue

        results.append({
            "text": documents[idx]["text"],
            "source": documents[idx]["source"],
            "distance": float(distance)
        })

    return results


load_documents()
create_vector_index()