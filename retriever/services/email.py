import os
from typing import Any, Dict, Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
DEFAULT_FROM = os.getenv("EMAIL_FROM", "Helen <no-reply@localhost>")

class EmailNotConfigured(Exception):
    pass

def send_template(to_email: str, template_id: str, dynamic_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Send a SendGrid dynamic template email.

    Args:
        to_email: Recipient email address
        template_id: SendGrid dynamic template ID
        dynamic_data: Dictionary of template data for handlebars variables

    Returns:
        Dict with message_id and status.
    """
    if not SENDGRID_API_KEY:
        raise EmailNotConfigured("SENDGRID_API_KEY is not set")

    message = Mail(
        from_email=DEFAULT_FROM,
        to_emails=to_email,
    )
    message.template_id = template_id
    if dynamic_data:
        message.dynamic_template_data = dynamic_data

    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)
    return {
        "status_code": response.status_code,
        "headers": dict(response.headers),
        "body": getattr(response, "body", None).decode("utf-8") if getattr(response, "body", None) else None,
    }

