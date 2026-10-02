from backend.ticket_classifier import classify_ticket


def test_vpn_ticket_classification():
    result = classify_ticket(
        "My VPN is not connecting and I cannot access the company network."
    )

    assert result["intent"] == "Incident"
    assert result["category"] == "Network"
    assert result["subcategory"] == "VPN"
    assert result["priority"] == "P2"
    assert result["assignment_group"] == "Network Support"


def test_password_ticket_classification():
    result = classify_ticket(
        "My password has expired and I cannot log in."
    )

    assert result["category"] == "Access Management"
    assert result["subcategory"] == "Password Reset"
    assert result["priority"] == "P2"
    assert result["assignment_group"] == "Service Desk"