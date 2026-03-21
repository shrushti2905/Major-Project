import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from bcrypt import hashpw, gensalt, checkpw
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillswap")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "your_secret_key_here")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

mongo = PyMongo(app)
jwt = JWTManager(app)

@app.route('/')
def index():
    return jsonify({
        "message": "SkillSwap Python API is running",
        "status": "online",
        "frontend_port": 5173
    }), 200

# --- AUTH ROUTES ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400
    
    hashed_password = hashpw(data.get('password').encode('utf-8'), gensalt()).decode('utf-8')
    
    new_user = {
        'name': data.get('name'),
        'email': email,
        'password': hashed_password,
        'skillsOffered': data.get('skillsOffered', []),
        'skillsWanted': data.get('skillsWanted', []),
        'bio': data.get('bio', ''),
        'location': data.get('location', ''),
        'role': data.get('role', 'user'),
        'isBlocked': False,
        'createdAt': datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = mongo.db.users.find_one({'email': email})
    
    if not user or not checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 400
    
    if user.get('isBlocked'):
        return jsonify({'message': 'User is blocked'}), 403
    
    token = create_access_token(identity={'id': str(user['_id']), 'role': user['role']})
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            '_id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

# --- USER ROUTES ---

@app.route('/api/users/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_identity = get_jwt_identity()
    user_id = user_identity['id']
    
    if request.method == 'GET':
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
        if not user:
            return jsonify({'message': 'User not found'}), 404
        user['id'] = str(user['_id'])
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    
    if request.method == 'PUT':
        data = request.get_json()
        update_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'skillsOffered': data.get('skillsOffered', []),
            'skillsWanted': data.get('skillsWanted', []),
            'bio': data.get('bio', ''),
            'location': data.get('location', '')
        }
        
        mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
        updated_user = mongo.db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
        updated_user['id'] = str(updated_user['_id'])
        updated_user['_id'] = str(updated_user['_id'])
        return jsonify(updated_user), 200

@app.route('/api/users/browse', methods=['GET'])
@jwt_required()
def browse_users():
    user_identity = get_jwt_identity()
    user_id = user_identity['id']
    
    users = list(mongo.db.users.find({
        '_id': {'$ne': ObjectId(user_id)},
        'isBlocked': False,
        'role': 'user'
    }, {'password': 0}))
    
    for user in users:
        user['id'] = str(user['_id'])
        user['_id'] = str(user['_id'])
        
    return jsonify(users), 200

# --- REQUEST ROUTES ---

@app.route('/api/requests/send', methods=['POST'])
@jwt_required()
def send_request():
    user_identity = get_jwt_identity()
    sender_id = user_identity['id']
    sender_role = user_identity['role']
    data = request.get_json()
    
    if sender_role == 'admin':
        return jsonify({'message': 'Admins cannot participate in skill swaps'}), 403
        
    receiver_id = data.get('receiverId')
    receiver = mongo.db.users.find_one({'_id': ObjectId(receiver_id)})
    
    if not receiver:
        return jsonify({'message': 'Receiver not found'}), 404
        
    if receiver.get('role') == 'admin':
        return jsonify({'message': 'Cannot send requests to administrators'}), 403
    
    new_request = {
        'senderId': ObjectId(sender_id),
        'receiverId': ObjectId(receiver_id),
        'skillOffered': data.get('skillOffered'),
        'skillRequested': data.get('skillRequested'),
        'status': 'pending',
        'createdAt': datetime.utcnow()
    }
    
    mongo.db.requests.insert_one(new_request)
    return jsonify({'message': 'Request sent'}), 201

@app.route('/api/requests/my-requests', methods=['GET'])
@jwt_required()
def my_requests():
    user_identity = get_jwt_identity()
    user_id = ObjectId(user_identity['id'])
    
    requests = list(mongo.db.requests.find({
        '$or': [{'senderId': user_id}, {'receiverId': user_id}]
    }))
    
    for r in requests:
        r['_id'] = str(r['_id'])
        sender = mongo.db.users.find_one({'_id': r['senderId']}, {'name': 1, 'email': 1})
        receiver = mongo.db.users.find_one({'_id': r['receiverId']}, {'name': 1, 'email': 1})
        
        r['senderId'] = {'_id': str(sender['_id']), 'name': sender['name'], 'email': sender['email']}
        r['receiverId'] = {'_id': str(receiver['_id']), 'name': receiver['name'], 'email': receiver['email']}
        
    return jsonify(requests), 200

@app.route('/api/requests/status', methods=['PUT'])
@jwt_required()
def update_request_status():
    user_identity = get_jwt_identity()
    user_id = user_identity['id']
    data = request.get_json()
    
    request_id = data.get('requestId')
    status = data.get('status')
    
    req = mongo.db.requests.find_one({'_id': ObjectId(request_id)})
    if not req:
        return jsonify({'message': 'Request not found'}), 404
    
    if str(req['receiverId']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    mongo.db.requests.update_one({'_id': ObjectId(request_id)}, {'$set': {'status': status}})
    return jsonify({'message': 'Status updated'}), 200

# --- ADMIN ROUTES ---

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if identity['role'] != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    users = list(mongo.db.users.find({}, {'password': 0}))
    for u in users:
        u['_id'] = str(u['_id'])
    return jsonify(users), 200

@app.route('/api/admin/requests', methods=['GET'])
@admin_required
def admin_get_requests():
    requests = list(mongo.db.requests.find())
    for r in requests:
        r['_id'] = str(r['_id'])
        sender = mongo.db.users.find_one({'_id': r['senderId']}, {'name': 1, 'email': 1})
        receiver = mongo.db.users.find_one({'_id': r['receiverId']}, {'name': 1, 'email': 1})
        r['senderId'] = {'_id': str(sender['_id']), 'name': sender['name'], 'email': sender['email']}
        r['receiverId'] = {'_id': str(receiver['_id']), 'name': receiver['name'], 'email': receiver['email']}
    return jsonify(requests), 200

@app.route('/api/admin/block-user', methods=['PUT'])
@admin_required
def admin_block_user():
    data = request.get_json()
    user_id = data.get('userId')
    is_blocked = data.get('isBlocked')
    
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'isBlocked': is_blocked}})
    return jsonify({'message': 'User status updated'}), 200

@app.route('/api/admin/user/<user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    mongo.db.users.delete_one({'_id': ObjectId(user_id)})
    mongo.db.requests.delete_many({
        '$or': [{'senderId': ObjectId(user_id)}, {'receiverId': ObjectId(user_id)}]
    })
    return jsonify({'message': 'User deleted'}), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Not Found",
        "message": "The requested URL was not found on the API server. If you are trying to access the website, please use the frontend URL (typically http://localhost:5173).",
        "path": request.path
    }), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
