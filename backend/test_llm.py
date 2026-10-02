from llm_service import generate_answer


question = "Why is my VPN authentication failing?"

context = """
Title: Corporate VPN Authentication Troubleshooting

Troubleshooting Steps:

1. Verify that the employee is connected to the internet.
2. Confirm that the employee is using the correct corporate username.
3. Check whether the employee password has expired.
4. Close and restart the VPN client.
5. Clear the VPN client cache if supported.
6. Reconnect to the corporate VPN.
7. If authentication continues to fail, check the VPN service status.
8. If the problem persists, escalate the issue to Network Support.
"""


answer = generate_answer(
    question,
    context
)


print("\n===== AI ANSWER =====\n")
print(answer)