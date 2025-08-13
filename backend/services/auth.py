from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models.user import User, UserSession, create_access_token, create_refresh_token, verify_token
from ..models.db import get_session_maker
from datetime import datetime, timedelta
import re

class AuthService:
    def __init__(self):
        self.SessionLocal = get_session_maker()

    def _validate_email(self, email: str) -> bool:
        """Valider le format d'un email."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def _validate_password(self, password: str) -> Tuple[bool, str]:
        """Valider la force d'un mot de passe."""
        if len(password) < 8:
            return False, "Le mot de passe doit contenir au moins 8 caractères"
        
        if not re.search(r'[A-Z]', password):
            return False, "Le mot de passe doit contenir au moins une majuscule"
        
        if not re.search(r'[a-z]', password):
            return False, "Le mot de passe doit contenir au moins une minuscule"
        
        if not re.search(r'\d', password):
            return False, "Le mot de passe doit contenir au moins un chiffre"
        
        return True, "Mot de passe valide"

    def _validate_username(self, username: str) -> Tuple[bool, str]:
        """Valider le format d'un nom d'utilisateur."""
        if len(username) < 3:
            return False, "Le nom d'utilisateur doit contenir au moins 3 caractères"
        
        if len(username) > 20:
            return False, "Le nom d'utilisateur ne peut pas dépasser 20 caractères"
        
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return False, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
        
        return True, "Nom d'utilisateur valide"

    def register_user(self, email: str, username: str, password: str, full_name: Optional[str] = None) -> Tuple[bool, dict]:
        """Enregistrer un nouvel utilisateur."""
        try:
            # Validation des données
            if not self._validate_email(email):
                return False, {"error": "Format d'email invalide"}
            
            username_valid, username_msg = self._validate_username(username)
            if not username_valid:
                return False, {"error": username_msg}
            
            password_valid, password_msg = self._validate_password(password)
            if not password_valid:
                return False, {"error": password_msg}
            
            # Vérifier si l'utilisateur existe déjà
            session = self.SessionLocal()
            
            existing_user = session.query(User).filter(
                (User.email == email) | (User.username == username)
            ).first()
            
            if existing_user:
                if existing_user.email == email:
                    return False, {"error": "Cet email est déjà utilisé"}
                else:
                    return False, {"error": "Ce nom d'utilisateur est déjà pris"}
            
            # Créer le nouvel utilisateur
            user = User(
                email=email.lower(),
                username=username.lower(),
                full_name=full_name
            )
            user.set_password(password)
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Créer les tokens
            access_token = create_access_token(data={"sub": user.id, "email": user.email})
            refresh_token = create_refresh_token(data={"sub": user.id})
            
            session.close()
            
            return True, {
                "message": "Utilisateur créé avec succès",
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token
            }
            
        except IntegrityError:
            session.rollback()
            session.close()
            return False, {"error": "Erreur lors de la création de l'utilisateur"}
        except Exception as e:
            session.rollback()
            session.close()
            return False, {"error": f"Erreur inattendue: {str(e)}"}

    def authenticate_user(self, email_or_username: str, password: str) -> Tuple[bool, dict]:
        """Authentifier un utilisateur."""
        try:
            session = self.SessionLocal()
            
            # Chercher l'utilisateur par email ou username
            user = session.query(User).filter(
                (User.email == email_or_username.lower()) | 
                (User.username == email_or_username.lower())
            ).first()
            
            if not user:
                session.close()
                return False, {"error": "Email ou nom d'utilisateur incorrect"}
            
            if not user.check_password(password):
                session.close()
                return False, {"error": "Mot de passe incorrect"}
            
            if not user.is_active:
                session.close()
                return False, {"error": "Compte désactivé"}
            
            # Mettre à jour la dernière connexion
            user.update_last_login()
            session.commit()
            
            # Créer les tokens
            access_token = create_access_token(data={"sub": user.id, "email": user.email})
            refresh_token = create_refresh_token(data={"sub": user.id})
            
            session.close()
            
            return True, {
                "message": "Connexion réussie",
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token
            }
            
        except Exception as e:
            session.close()
            return False, {"error": f"Erreur lors de l'authentification: {str(e)}"}

    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, dict]:
        """Rafraîchir un token d'accès."""
        try:
            # Vérifier le token de rafraîchissement
            payload = verify_token(refresh_token)
            if not payload or payload.get("type") != "refresh":
                return False, {"error": "Token de rafraîchissement invalide"}
            
            user_id = payload.get("sub")
            if not user_id:
                return False, {"error": "Token de rafraîchissement invalide"}
            
            # Vérifier que l'utilisateur existe toujours
            session = self.SessionLocal()
            user = session.query(User).filter(User.id == user_id, User.is_active == True).first()
            
            if not user:
                session.close()
                return False, {"error": "Utilisateur non trouvé ou désactivé"}
            
            # Créer un nouveau token d'accès
            new_access_token = create_access_token(data={"sub": user.id, "email": user.email})
            
            session.close()
            
            return True, {
                "access_token": new_access_token,
                "user": user.to_dict()
            }
            
        except Exception as e:
            return False, {"error": f"Erreur lors du rafraîchissement: {str(e)}"}

    def get_current_user(self, token: str) -> Tuple[bool, dict]:
        """Récupérer l'utilisateur actuel à partir du token."""
        try:
            # Vérifier le token
            payload = verify_token(token)
            if not payload or payload.get("type") != "access":
                return False, {"error": "Token d'accès invalide"}
            
            user_id = payload.get("sub")
            if not user_id:
                return False, {"error": "Token d'accès invalide"}
            
            # Récupérer l'utilisateur
            session = self.SessionLocal()
            user = session.query(User).filter(User.id == user_id, User.is_active == True).first()
            
            if not user:
                session.close()
                return False, {"error": "Utilisateur non trouvé ou désactivé"}
            
            session.close()
            
            return True, {"user": user.to_dict()}
            
        except Exception as e:
            return False, {"error": f"Erreur lors de la récupération de l'utilisateur: {str(e)}"}

    def change_password(self, user_id: str, current_password: str, new_password: str) -> Tuple[bool, dict]:
        """Changer le mot de passe d'un utilisateur."""
        try:
            session = self.SessionLocal()
            
            # Récupérer l'utilisateur
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                session.close()
                return False, {"error": "Utilisateur non trouvé"}
            
            # Vérifier l'ancien mot de passe
            if not user.check_password(current_password):
                session.close()
                return False, {"error": "Mot de passe actuel incorrect"}
            
            # Valider le nouveau mot de passe
            password_valid, password_msg = self._validate_password(new_password)
            if not password_valid:
                session.close()
                return False, {"error": password_msg}
            
            # Changer le mot de passe
            user.set_password(new_password)
            session.commit()
            
            session.close()
            
            return True, {"message": "Mot de passe modifié avec succès"}
            
        except Exception as e:
            session.rollback()
            session.close()
            return False, {"error": f"Erreur lors du changement de mot de passe: {str(e)}"}

    def update_user_profile(self, user_id: str, **kwargs) -> Tuple[bool, dict]:
        """Mettre à jour le profil d'un utilisateur."""
        try:
            session = self.SessionLocal()
            
            # Récupérer l'utilisateur
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                session.close()
                return False, {"error": "Utilisateur non trouvé"}
            
            # Mettre à jour les champs autorisés
            allowed_fields = ['full_name', 'bio', 'avatar_url', 'preferences']
            for field, value in kwargs.items():
                if field in allowed_fields and hasattr(user, field):
                    setattr(user, field, value)
            
            session.commit()
            session.refresh(user)
            
            session.close()
            
            return True, {
                "message": "Profil mis à jour avec succès",
                "user": user.to_dict()
            }
            
        except Exception as e:
            session.rollback()
            session.close()
            return False, {"error": f"Erreur lors de la mise à jour du profil: {str(e)}"}

    def deactivate_user(self, user_id: str) -> Tuple[bool, dict]:
        """Désactiver un utilisateur."""
        try:
            session = self.SessionLocal()
            
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                session.close()
                return False, {"error": "Utilisateur non trouvé"}
            
            user.is_active = False
            session.commit()
            
            session.close()
            
            return True, {"message": "Utilisateur désactivé avec succès"}
            
        except Exception as e:
            session.rollback()
            session.close()
            return False, {"error": f"Erreur lors de la désactivation: {str(e)}"}

# Instance singleton du service d'authentification
auth_service = AuthService() 