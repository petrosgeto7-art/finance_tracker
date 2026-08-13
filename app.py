from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'finance.db')

app = Flask(__name__, static_folder='static', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'date': self.date,
        }


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    txs = Transaction.query.order_by(Transaction.id.desc()).all()
    return jsonify([t.to_dict() for t in txs])


@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json() or {}
    description = data.get('description', '').strip()
    amount = data.get('amount')
    if not description or amount is None:
        return jsonify({'error': 'description and amount are required'}), 400
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'error': 'amount must be a number'}), 400
    date = data.get('date') or datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    tx = Transaction(description=description, amount=amount, date=date)
    db.session.add(tx)
    db.session.commit()
    return jsonify(tx.to_dict()), 201


@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    tx = Transaction.query.get(tx_id)
    if not tx:
        return jsonify({'error': 'not found'}), 404
    db.session.delete(tx)
    db.session.commit()
    return jsonify({'result': 'deleted'})


if __name__ == '__main__':
    db_exists = os.path.exists(DB_PATH)
    if not db_exists:
        db.create_all()
    app.run(debug=True)
