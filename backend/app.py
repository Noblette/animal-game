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

# ==================== ROUTE MOT DE PASSE OUBLIÉ ====================
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email requis"}), 400

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        # On renvoie toujours le même message pour des raisons de sécurité
        return jsonify({"message": "Si cet email existe, un lien de réinitialisation a été envoyé."})

    # Générer un token
    reset_token = str(uuid.uuid4())
    expiry = datetime.now() + timedelta(hours=1)  # Valable 1 heure

    # Sauvegarder le token dans la base
    cursor.execute("""
        UPDATE users 
        SET reset_token = %s, reset_token_expiry = %s 
        WHERE email = %s
    """, (reset_token, expiry, email))
    db.commit()

    # Lien de réinitialisation
    reset_link = f"http://localhost:3002/reset-password/{reset_token}"

    # Envoi de l'email
    try:
        msg = Message(
            subject="Réinitialisation de votre mot de passe",
            recipients=[email],
            body=f"""
            Bonjour,

            Vous avez demandé une réinitialisation de mot de passe.
            Cliquez sur ce lien pour réinitialiser votre mot de passe :

            {reset_link}

            Ce lien expire dans 1 heure.

            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
            """
        )
        mail.send(msg)

        return jsonify({"message": "Un email de réinitialisation a été envoyé."})
    except Exception as e:
        print(e)
        return jsonify({"message": "Erreur lors de l'envoi de l'email"}), 500




if __name__ == "__main__":
    app.run(debug=True)