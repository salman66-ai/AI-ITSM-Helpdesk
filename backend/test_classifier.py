from ticket_classifier import classify_ticket


question = "My VPN is not connecting and authentication keeps failing."

result = classify_ticket(question)

print("\n===== AI TICKET CLASSIFICATION =====\n")

for key, value in result.items():
    print(f"{key}: {value}")