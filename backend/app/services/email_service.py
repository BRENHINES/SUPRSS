import os
from email.message import EmailMessage
import aiosmtplib

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", "SUPRSS <noreply@example.com>")

def _smtp_configured() -> bool:
    return all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD])

async def send_email(to: str, subject: str, html: str, text: str | None = None):
    if not _smtp_configured():
        # Mode "dry-run" si SMTP pas complet
        print("[EMAIL DRYRUN]", {"to": to, "subject": subject, "html": html})
        return

    msg = EmailMessage()
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject
    if text:
        msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        timeout=30,
    )

def verification_email_html(link: str) -> str:
    return f"""
    <div>
      <p>Bienvenue sur SUPRSS !</p>
      <p>Merci de vérifier votre e-mail en cliquant sur ce lien :</p>
      <p><a href="{link}">{link}</a></p>
    </div>
    """

def reset_email_html(link: str) -> str:
    return f"""
    <div>
      <p>Réinitialisation du mot de passe SUPRSS</p>
      <p>Pour choisir un nouveau mot de passe, cliquez sur ce lien :</p>
      <p><a href="{link}">{link}</a></p>
    </div>
    """
