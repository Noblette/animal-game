from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector
import bcrypt
import uuid
from flask_mail import Mail, Message
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# =========================
# CONFIG DATABASE
# =========================
DB_CONFIG = {
    "host": "localhost",
    "user": "gamer",
    "password": "tsyHaiko#123",
    "database": "game"
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


# =========================
# HOME
# =========================
@app.route("/")
def home():
    return "Backend is running"


#################
def create_default_admin():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM users
        WHERE email=%s
    """, ("noblette.tsimihanta@gmail.com",))

    admin = cursor.fetchone()

    if not admin:

        hashed_password = bcrypt.hashpw(
            "tsyHaiko123@".encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute("""
            INSERT INTO users (
                email,
                password,
                first_name,
                last_name,
                phone,
                genre,
                adresse,
                photo,
                date_naissance,
                role
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            "noblette.tsimihanta@gmail.com",
            hashed_password,
            "Fenotoky",
            "Noblette",
            "0349954043",
            "female",
            "Isada Fianarantsoa",
            "uploads/default.jpg",
            "2004-05-31",
            "admin"
        ))

        db.commit()

        print("✅ Admin par défaut créé")

    cursor.close()
    db.close()
##################""


# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM users
        WHERE email = %s
        AND is_deleted = 0
    """, (email,))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user and bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        return jsonify({
            "message": "Login successful",
            "user_id": user["id"],
            "role": user["role"]
        })

    return jsonify({
        "message": "Invalid credentials"
    }), 401


# =========================
# REGISTER
# =========================
@app.route("/register", methods=["POST"])
def register():

    email = request.form.get("email")
    password = request.form.get("password")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    phone = request.form.get("phone")
    genre = request.form.get("genre")
    adresse = request.form.get("adresse")
    date_naissance = request.form.get("date_naissance")

    file = request.files.get("photo")

    allowed_genres = ["male", "female", "other"]

    if genre not in allowed_genres:
        return jsonify({
            "message": "Invalid genre"
        }), 400

    # =========================
    # IMAGE
    # =========================
    photo_path = None

    if file:
        filename = str(uuid.uuid4()) + "_" + file.filename
        file.save("uploads/" + filename)
        photo_path = "uploads/" + filename

    # =========================
    # PASSWORD HASH
    # =========================
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    db = get_db()
    cursor = db.cursor()

    query = """
        INSERT INTO users
        (
            email,
            password,
            first_name,
            last_name,
            phone,
            genre,
            adresse,
            photo,
            date_naissance
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    cursor.execute(query, (
        email,
        hashed_password.decode("utf-8"),
        first_name,
        last_name,
        phone,
        genre,
        adresse,
        photo_path,
        date_naissance
    ))

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "User registered successfully"
    })


# =========================
# GET USER
# =========================
@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM users
        WHERE id = %s
    """, (user_id,))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user:
        return jsonify(user)

    return jsonify({
        "message": "User not found"
    }), 404


# =========================
# UPLOAD IMAGE
# =========================
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)


# =========================
# CONFIG MAIL
# =========================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'noblette.tsimihanta@gmail.com'
app.config['MAIL_PASSWORD'] = 'knex wyzt tlor zmwk'
app.config['MAIL_DEFAULT_SENDER'] = 'noblette.tsimihanta@gmail.com'

mail = Mail(app)


# =========================
# OTP STORAGE
# =========================
otp_storage = {}


# =========================
# FORGOT PASSWORD
# =========================
@app.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({
            "message": "Email requis"
        }), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id
        FROM users
        WHERE email = %s
        AND is_deleted = 0
    """, (email,))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    # sécurité
    if not user:
        return jsonify({
            "message": "Si cet email existe, un code vous a été envoyé."
        })

    # génération OTP
    code = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)

    otp_storage[email] = {
        "code": code,
        "expiry": expiry
    }

    try:
        msg = Message(
            subject="Code de vérification",
            recipients=[email],
            body=f"""
Bonjour,

Votre code de vérification est : {code}

Ce code expire dans 10 minutes.

Animal Game Team
"""
        )

        mail.send(msg)

        return jsonify({
            "message": "Un code a été envoyé à votre email."
        })

    except Exception as e:
        print("Erreur email :", e)

        return jsonify({
            "message": "Erreur lors de l'envoi du code"
        }), 500


# =========================
# VERIFY OTP
# =========================
@app.route("/verify-otp", methods=["POST"])
def verify_otp():

    data = request.json

    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({
            "message": "Données manquantes"
        }), 400

    if email not in otp_storage:
        return jsonify({
            "message": "Code invalide ou expiré"
        }), 400

    stored = otp_storage[email]

    # OTP invalide
    if (
        datetime.now() > stored["expiry"]
        or stored["code"] != code
    ):
        del otp_storage[email]

        return jsonify({
            "message": "Code invalide ou expiré"
        }), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            first_name,
            last_name,
            role
        FROM users
        WHERE email = %s
        AND is_deleted = 0
    """, (email,))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    del otp_storage[email]

    if not user:
        return jsonify({
            "message": "Utilisateur introuvable"
        }), 404

    return jsonify({
        "message": "Connexion réussie",
        "user_id": user["id"],
        "role": user["role"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    })


# =========================
# RUN APP
# =========================

if __name__ == "__main__":
    create_default_admin()
    app.run(debug=True)