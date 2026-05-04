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
        return jsonify({
            "message": "Login successful",
            "user_id": user["id"]
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
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email requis"}), 400

    # Vérifier si l'email existe
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "Si cet email existe, un code vous a été envoyé."})

    # Générer un code à 6 chiffres
    code = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)

    otp_storage[email] = {"code": code, "expiry": expiry}

    # Envoi de l'email
    try:
        msg = Message(
            subject="Code de réinitialisation de mot de passe",
            recipients=[email],
            body=f"""
            Bonjour,

            Voici votre code de réinitialisation : {code}

            Ce code est valable pendant 10 minutes.

            Si vous n'avez pas demandé ce code, ignorez cet email.
            """
        )
        mail.send(msg)

        return jsonify({"message": "Un code de vérification a été envoyé à votre email."})
    except Exception as e:
        print("Erreur email:", e)
        return jsonify({"message": "Erreur lors de l'envoi du code"}), 500


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    code = data.get("code")
    new_password = data.get("new_password")

    if not email or not code or not new_password:
        return jsonify({"message": "Données manquantes"}), 400

    # Vérifier l'OTP
    if email not in otp_storage:
        return jsonify({"message": "Code invalide ou expiré"}), 400

    stored = otp_storage[email]
    if datetime.now() > stored["expiry"]:
        del otp_storage[email]
        return jsonify({"message": "Code expiré"}), 400

    if stored["code"] != code:
        return jsonify({"message": "Code incorrect"}), 400

    # Tout est bon → mise à jour du mot de passe
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

    cursor = db.cursor()
    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed.decode('utf-8'), email))
    db.commit()

    # Supprimer l'OTP
    del otp_storage[email]

    return jsonify({"message": "Mot de passe modifié avec succès"})


if __name__ == "__main__":
    app.run(debug=True)