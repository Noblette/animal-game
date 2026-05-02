from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import bcrypt

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
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

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

    # 📸 Gestion image
    photo_path = None
    if file:
        filename = file.filename
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



if __name__ == "__main__":
    app.run(debug=True)