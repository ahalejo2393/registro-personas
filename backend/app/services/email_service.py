import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_reset_password_email(email: str, token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    if settings.CONSOLE_EMAIL_MODE or not settings.SMTP_USER:
        logger.info(f"[MODO CONSOLA] Reset link para {email}: {reset_link}")
        print(f"\n{'='*60}")
        print(f"RESET PASSWORD LINK para {email}:")
        print(reset_link)
        print(f"{'='*60}\n")
        return

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Restablecer contraseña"
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = email

        html = f"""
        <html><body>
        <h2>Restablecer contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="{reset_link}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">
            Restablecer contraseña
        </a>
        <p>Este enlace expira en {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutos.</p>
        <p>Si no solicitaste esto, ignora este correo.</p>
        </body></html>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.FROM_EMAIL, email, msg.as_string())
    except Exception as e:
        logger.error(f"Error enviando email a {email}: {e}")
