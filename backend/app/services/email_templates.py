# backend/app/services/email_templates.py
import os
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def verify_email_html(link: str):
    return f"""
    <h2>Vérifiez votre adresse e-mail</h2>
    <p>Merci d'avoir créé un compte SUPRSS. Pour finaliser l'inscription, cliquez :</p>
    <p><a href="{link}">Vérifier mon e-mail</a></p>
    """

def welcome_html():
    return """
    <h2>Bienvenue sur SUPRSS</h2>
    <p>Votre compte est prêt. Bon voyage !</p>
    """

def password_reset_html(link: str):
    return f"""
    <h2>Réinitialiser votre mot de passe</h2>
    <p>Cliquez sur le lien :</p>
    <p><a href="{link}">Définir un nouveau mot de passe</a></p>
    """
