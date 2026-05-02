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
    data = request.json

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cursor = db.cursor()

    query = """
    INSERT INTO users 
    (email, password, first_name, last_name)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(query, (
        email,
        hashed.decode('utf-8'),
        first_name,
        last_name
    ))

    db.commit()

    return jsonify({"message": "User registered"})




if __name__ == "__main__":
    app.run(debug=True)