from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import bcrypt
import uuid;
from flask_mail import Mail, Message
import uuid
from datetime import datetime, timedelta
import random






app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host="localhost",
    user="gamer",
    password="tsyHaiko#123",
    database="game"
)


@app.route("/")
def home():
    return "Backend is running"

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if user and bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        if user["is_deleted"]:
            return jsonify({"message": "Compte supprimé"}), 403

        return jsonify({
            "message": "Login successful",
            "user_id": user["id"],
            "role": user["role"]
        })

    else:
        return jsonify({"message": "Invalid credentials"}), 401
    # const id = uuidv4();
    # console.log(id);

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

    # 📸 Gestion image
    photo_path = None
    if file:
        """ filename = file.filename
        file.save("uploads/" + filename) """
        

        filename = str(uuid.uuid4()) + "_" + file.filename
        file.save("uploads/" + filename)
        photo_path = "uploads/" + filename

    # 🔐 Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cursor = db.cursor()

    query = """
    INSERT INTO users 
    (email, password, first_name, last_name, phone, genre, adresse, photo, date_naissance)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    cursor.execute(query, (
        email,
        hashed.decode('utf-8'),
        first_name,
        last_name,
        phone,
        genre,
        adresse,
        photo_path,
        date_naissance
    ))

    db.commit()

    return jsonify({"message": "User registered successfully"})



@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    if user:
        return jsonify(user)
    else:
        return jsonify({"message": "User not found"}), 404
    

from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)




# Configuration Mail (à mettre après app = Flask(__name__))
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'noblette.tsimihanta@gmail.com'          # Ton email
app.config['MAIL_PASSWORD'] = 'knex wyzt tlor zmwk' # ← Très important
app.config['MAIL_DEFAULT_SENDER'] = 'noblette.tsimihanta@gmail.com'

mail = Mail(app)

# Stockage temporaire des OTP (en mémoire)
otp_storage = {}   # {email: {"code": "123456", "expiry": datetime}}

# ==================== ROUTE MOT DE PASSE OUBLIÉ ====================
# ==================== CONFIG EMAIL (déjà fait) ====================
# otp_storage = {}  # déjà déclaré plus haut

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email requis"}), 400

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if not cursor.fetchone():
        return jsonify({"message": "Si cet email existe, un code vous a été envoyé."})

    code = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)

    otp_storage[email] = {"code": code, "expiry": expiry}

    try:
        msg = Message(
            subject="Code de vérification",
            recipients=[email],
            body=f"""
            Bonjour,

            Votre code de vérification est : {code}

            Ce code expire dans 10 minutes.
            """
        )
        mail.send(msg)
        return jsonify({"message": "Un code a été envoyé à votre email."})
    except:
        return jsonify({"message": "Erreur lors de l'envoi du code"}), 500


@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({"message": "Données manquantes"}), 400

    if email not in otp_storage:
        return jsonify({"message": "Code invalide ou expiré"}), 400

    stored = otp_storage[email]
    if datetime.now() > stored["expiry"] or stored["code"] != code:
        del otp_storage[email]
        return jsonify({"message": "Code invalide ou expiré"}), 400

    # Code correct → Connexion
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, first_name, last_name FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    del otp_storage[email]  # Nettoyage

    return jsonify({
        "message": "Connexion réussie",
        "user_id": user["id"]
    })

if __name__ == "__main__":
    app.run(debug=True)