from rag_service import search_knowledge


question = "Why is my VPN authentication failing?"


results = search_knowledge(
    question,
    top_k=3
)


print("\n===== RAG SEARCH RESULTS =====\n")


for i, result in enumerate(results, start=1):

    print(f"Result {i}")
    print(f"Source: {result['source']}")
    print(f"Distance: {result['distance']:.4f}")
    print(f"Content:\n{result['text']}")
    print("-" * 60)