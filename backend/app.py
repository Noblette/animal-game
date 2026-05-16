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
# CONNEXION BASE DE DONNÉES
# =========================
db = mysql.connector.connect(
    host="localhost",
    user="gamer",
    password="tsyHaiko#123",
    database="game"
)

# Fonction pour reconnecter si besoin
def get_db():
    global db

    if not db.is_connected():
        db.reconnect(attempts=3, delay=2)

    return db

@app.route("/")
def home():
    return "Backend is running"

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    db_conn = get_db()
    cursor = db_conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM users
        WHERE email=%s
        AND is_deleted = 0
    """, (email,))

    user = cursor.fetchone()
    cursor.close()

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
        return jsonify({"message": "Invalid genre"}), 400

    # Gestion image
    photo_path = None

    if file:
        filename = str(uuid.uuid4()) + "_" + file.filename
        file.save("uploads/" + filename)
        photo_path = "uploads/" + filename

    # Hash password
    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    db_conn = get_db()
    cursor = db_conn.cursor()

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
        hashed.decode("utf-8"),
        first_name,
        last_name,
        phone,
        genre,
        adresse,
        photo_path,
        date_naissance
    ))

    db_conn.commit()
    cursor.close()

    return jsonify({
        "message": "User registered successfully"
    })


@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):

    db_conn = get_db()
    cursor = db_conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM users
        WHERE id=%s
    """, (user_id,))

    user = cursor.fetchone()
    cursor.close()

    if user:
        return jsonify(user)

    return jsonify({
        "message": "User not found"
    }), 404




from flask import send_from_directory

# ==================== UPLOAD IMAGE ====================
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)


# ==================== CONFIG MAIL ====================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'noblette.tsimihanta@gmail.com'
app.config['MAIL_PASSWORD'] = 'knex wyzt tlor zmwk'
app.config['MAIL_DEFAULT_SENDER'] = 'noblette.tsimihanta@gmail.com'

mail = Mail(app)


# ==================== STOCKAGE OTP ====================
otp_storage = {}
# format:
# {
#   "email@gmail.com": {
#       "code": "123456",
#       "expiry": datetime
#   }
# }


# ==================== MOT DE PASSE OUBLIÉ ====================
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        db.ping(reconnect=True)

        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({
                "message": "Email requis"
            }), 400

        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id
            FROM users
            WHERE email = %s
            AND is_deleted = 0
        """, (email,))

        user = cursor.fetchone()

        cursor.close()

        # sécurité : ne pas révéler si email existe
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

    except Exception as e:
        print("Erreur forgot-password :", e)

        return jsonify({
            "message": "Erreur serveur"
        }), 500


# ==================== VERIFICATION OTP ====================
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        db.ping(reconnect=True)

        data = request.json

        email = data.get("email")
        code = data.get("code")

        if not email or not code:
            return jsonify({
                "message": "Données manquantes"
            }), 400

        # email absent
        if email not in otp_storage:
            return jsonify({
                "message": "Code invalide ou expiré"
            }), 400

        stored = otp_storage[email]

        # OTP expiré ou faux
        if (
            datetime.now() > stored["expiry"]
            or stored["code"] != code
        ):
            del otp_storage[email]

            return jsonify({
                "message": "Code invalide ou expiré"
            }), 400

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

        # suppression OTP
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

    except Exception as e:
        print("Erreur verify-otp :", e)

        return jsonify({
            "message": "Erreur serveur"
        }), 500


# ==================== RUN APP ====================
if __name__ == "__main__":
    app.run(debug=True)