import logging
import os
import smtplib
from email.message import EmailMessage

from models import User

logger = logging.getLogger("mi-proyecto1.notifications")
logging.basicConfig(level=logging.INFO)


def send_admin_notification(pending_user: User) -> None:
    """Avisa al maestro (admin) que hay una solicitud de acceso nueva.

    Si no hay SMTP configurado por variables de entorno (caso actual, sin
    credenciales reales todavía), solo lo deja registrado en el log para que
    el flujo se pueda demostrar sin depender de un correo real.
    """
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = os.environ.get("SMTP_PORT")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    admin_email = os.environ.get("ADMIN_EMAIL")

    if not all([smtp_host, smtp_port, smtp_user, smtp_pass, admin_email]):
        logger.info(
            "[NOTIFICACION ADMIN] Nueva solicitud de acceso: %s (%s) — revisar en /admin",
            pending_user.email,
            pending_user.display_name,
        )
        return

    message = EmailMessage()
    message["Subject"] = "Nueva solicitud de acceso — mi-proyecto1"
    message["From"] = smtp_user
    message["To"] = admin_email
    message.set_content(
        f"El usuario {pending_user.display_name} ({pending_user.email}) solicitó acceso "
        "a la plataforma. Revisa y aprueba o rechaza la solicitud en /admin."
    )

    with smtplib.SMTP(smtp_host, int(smtp_port)) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_pass)
        smtp.send_message(message)
