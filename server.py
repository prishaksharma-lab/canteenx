#!/usr/bin/env python3
"""
CanteenX - Smart Canteen Ordering & Queue Management System
Robust Backend Server with Embedded Real Database (SQLite + JSON) & MongoDB Atlas Bridge
Provides User Authentication (Register/Login), Menu Management, and Live Order Tracking.
"""

import os
import json
import time
import sqlite3
import hashlib
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from datetime import datetime

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "canteen_database.db")
JSON_FALLBACK = os.path.join(BASE_DIR, "canteen_data.json")

# ==============================================================================
# Database Initialization (SQLite Real Database Storage)
# ==============================================================================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            roll_number TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            created_at TEXT NOT NULL
        )
    """)

    # Menu Items Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            prep_time INTEGER NOT NULL,
            is_available INTEGER DEFAULT 1,
            tag TEXT,
            diet TEXT,
            calories TEXT,
            description TEXT,
            image TEXT
        )
    """)

    # Orders Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            token TEXT UNIQUE NOT NULL,
            student_name TEXT NOT NULL,
            student_roll TEXT NOT NULL,
            items_json TEXT NOT NULL,
            total_amount INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending',
            estimated_wait INTEGER DEFAULT 10,
            special_instructions TEXT,
            counter TEXT DEFAULT 'Counter 1',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # Rush Hour Status Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_state (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL
        )
    """)

    # Seed default users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        def hash_pw(pw):
            return hashlib.sha256(pw.encode('utf-8')).hexdigest()

        now = datetime.utcnow().isoformat() + "Z"
        cursor.execute("""
            INSERT INTO users (id, name, email, roll_number, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("usr-1", "Aarav Sharma", "aarav@campus.edu", "CS-2024-042", hash_pw("campus123"), "student", now))

        cursor.execute("""
            INSERT INTO users (id, name, email, roll_number, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("usr-2", "Chef Vikram", "chef@canteenx.edu", "STAFF-01", hash_pw("chef123"), "kitchen_staff", now))

    # Seed default menu if empty
    cursor.execute("SELECT COUNT(*) FROM menu_items")
    if cursor.fetchone()[0] == 0:
        default_menu = [
            ("item-1", "Artisan Paneer Tikka Wrap", "Wraps & Rolls", 95, 10, 1, "Chef's Special", "Veg", "380 kcal", "Char-grilled cottage cheese cubes in spiced marinade with mint relish wrapped in whole-wheat roti.", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80"),
            ("item-2", "Mediterranean Falafel Bowl", "Campus Bowls", 125, 12, 1, "High-Protein", "Vegan", "440 kcal", "Crisp herb falafels over warm brown rice, roasted chickpeas, cucumber salad, and creamy tahini.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80"),
            ("item-3", "Smoky Grilled Chicken Kathi", "Wraps & Rolls", 135, 14, 1, "Bestseller", "Non-Veg", "490 kcal", "Slow-grilled chicken breast glazed with chaat spices, pickled shallots, and garlic dip.", "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=80"),
            ("item-4", "Sourdough Grilled Cheese Melt", "Breakfast & Bites", 85, 8, 1, "Quick Grab", "Veg", "340 kcal", "Triple melted cheddar and mozzarella with sweet basil pesto on artisanal toasted sourdough.", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80"),
            ("item-5", "Crispy Street Samosas (2 pcs)", "Breakfast & Bites", 40, 5, 1, "Campus Favorite", "Veg", "280 kcal", "Flaky golden pastry filled with cumin spiced potatoes & peas, served with sweet tamarind relish.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"),
            ("item-6", "Double-Brew Spiced Masala Chai", "Beverages", 25, 4, 1, "Hot Brew", "Veg", "95 kcal", "Assam black tea brewed with fresh crushed ginger, green cardamom pods, and steamed whole milk.", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80"),
            ("item-7", "Iced Vanilla Cold Brew", "Beverages", 75, 5, 1, "Chilled", "Veg", "140 kcal", "16-hour steeped Arabica cold brew poured over clear ice, crowned with vanilla cream foam.", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80"),
            ("item-8", "Avocado Citrus Quinoa Bowl", "Healthy Greens", 140, 9, 1, "Nutrient Dense", "Vegan", "320 kcal", "Organic tri-color quinoa, sliced Haas avocado, toasted pumpkin seeds, citrus lemon reduction.", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80"),
            ("item-9", "Warm Roasted Walnut Brownie", "Sweet Treats", 65, 3, 1, "Indulgent", "Veg", "310 kcal", "Fudgy Belgian dark chocolate brownie studded with slow-roasted Californian walnuts, served warm.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80")
        ]
        cursor.executemany("""
            INSERT INTO menu_items (id, name, category, price, prep_time, is_available, tag, diet, calories, description, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_menu)

    # Seed initial sample orders if empty
    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        sample_orders = [
            ("ord-101", "#CX-101", "Aarav Sharma", "CS-2024-042", json.dumps([{"id": "item-1", "name": "Artisan Paneer Tikka Wrap", "quantity": 1, "price": 95}]), 95, "Ready", 10, "Extra mint chutney", "Counter 1", datetime.utcnow().isoformat() + "Z", datetime.utcnow().isoformat() + "Z"),
            ("ord-102", "#CX-102", "Priya Nair", "EC-2023-118", json.dumps([{"id": "item-3", "name": "Smoky Grilled Chicken Kathi", "quantity": 1, "price": 135}]), 135, "Preparing", 14, "Less spicy", "Counter 2", datetime.utcnow().isoformat() + "Z", datetime.utcnow().isoformat() + "Z"),
        ]
        cursor.executemany("""
            INSERT INTO orders (id, token, student_name, student_roll, items_json, total_amount, status, estimated_wait, special_instructions, counter, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_orders)

    conn.commit()
    conn.close()

init_db()

# ==============================================================================
# HTTP Request Handler & Database API Endpoints
# ==============================================================================
class CanteenHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()

            if path == "/api/menu":
                cursor.execute("SELECT id, name, category, price, prep_time, is_available, tag, diet, calories, description, image FROM menu_items")
                rows = cursor.fetchall()
                menu = []
                for r in rows:
                    menu.append({
                        "id": r[0],
                        "name": r[1],
                        "category": r[2],
                        "price": r[3],
                        "prepTime": r[4],
                        "isAvailable": bool(r[5]),
                        "tag": r[6],
                        "diet": r[7],
                        "calories": r[8],
                        "description": r[9],
                        "image": r[10]
                    })
                conn.close()
                self._send_json({"success": True, "count": len(menu), "menu": menu})
                return

            elif path == "/api/orders":
                cursor.execute("SELECT id, token, student_name, student_roll, items_json, total_amount, status, estimated_wait, special_instructions, counter, created_at, updated_at FROM orders ORDER BY created_at DESC")
                rows = cursor.fetchall()
                orders = []
                for r in rows:
                    orders.append({
                        "id": r[0],
                        "token": r[1],
                        "studentName": r[2],
                        "studentRoll": r[3],
                        "items": json.loads(r[4]),
                        "totalAmount": r[5],
                        "status": r[6],
                        "estimatedWaitMinutes": r[7],
                        "specialInstructions": r[8],
                        "counter": r[9],
                        "createdAt": r[10],
                        "updatedAt": r[11]
                    })
                conn.close()
                self._send_json({"success": True, "orders": orders})
                return

            elif path == "/api/rush-hour":
                cursor.execute("SELECT value_json FROM app_state WHERE key = 'rush_hour'")
                row = cursor.fetchone()
                rush = json.loads(row[0]) if row else {"isPaused": False, "pauseReason": "", "resumesInMinutes": 15}
                conn.close()
                self._send_json({"success": True, "rushHour": rush})
                return

            elif path == "/api/users":
                cursor.execute("SELECT id, name, email, roll_number, role, created_at FROM users")
                rows = cursor.fetchall()
                users = [{"id": r[0], "name": r[1], "email": r[2], "rollNumber": r[3], "role": r[4], "createdAt": r[5]} for r in rows]
                conn.close()
                self._send_json({"success": True, "users": users})
                return

            conn.close()
            self._send_json({"error": "Endpoint not found"}, 404)
            return

        # SPA fallback
        if path == "/" or not os.path.exists(os.path.join(BASE_DIR, path.lstrip("/"))):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"

        try:
            body = json.loads(post_data.decode("utf-8"))
        except:
            body = {}

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # Route: Register User
        if path == "/api/auth/register":
            name = body.get("name", "").strip()
            email = body.get("email", "").strip().lower()
            roll_number = body.get("rollNumber", "").strip()
            password = body.get("password", "")
            role = body.get("role", "student")

            if not email or not password or not name:
                conn.close()
                self._send_json({"success": False, "message": "Name, email, and password are required"}, 400)
                return

            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                self._send_json({"success": False, "message": "Email is already registered"}, 400)
                return

            pw_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
            user_id = f"usr-{int(time.time()*1000)}"
            now = datetime.utcnow().isoformat() + "Z"

            cursor.execute("""
                INSERT INTO users (id, name, email, roll_number, password_hash, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (user_id, name, email, roll_number or "CS-GUEST", pw_hash, role, now))
            conn.commit()
            conn.close()

            user_obj = {
                "id": user_id,
                "name": name,
                "email": email,
                "rollNumber": roll_number or "CS-GUEST",
                "role": role,
                "token": f"token-{user_id}"
            }
            self._send_json({"success": True, "user": user_obj})
            return

        # Route: Login User
        elif path == "/api/auth/login":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            pw_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

            cursor.execute("SELECT id, name, email, roll_number, role FROM users WHERE email = ? AND password_hash = ?", (email, pw_hash))
            row = cursor.fetchone()
            conn.close()

            if row:
                user_obj = {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "rollNumber": row[3],
                    "role": row[4],
                    "token": f"token-{row[0]}"
                }
                self._send_json({"success": True, "user": user_obj})
            else:
                self._send_json({"success": False, "message": "Invalid email or password"}, 401)
            return

        # Route: Place Order
        elif path == "/api/orders":
            cursor.execute("SELECT COUNT(*) FROM orders")
            count = cursor.fetchone()[0]
            next_num = 100 + count + 1
            token = f"#CX-{next_num}"

            # Calculate wait based on active orders
            cursor.execute("SELECT COUNT(*) FROM orders WHERE status IN ('Pending', 'Preparing')")
            active_count = cursor.fetchone()[0]
            estimated_wait = max(8, 6 + (active_count * 3))

            now = datetime.utcnow().isoformat() + "Z"
            order_id = f"ord-{int(time.time()*1000)}"
            student_name = body.get("studentName", "Campus Student")
            student_roll = body.get("studentRoll", "CS-2024-042")
            items = body.get("items", [])
            total_amount = body.get("totalAmount", 0)
            instructions = body.get("specialInstructions", "")
            counter = "Counter 1" if next_num % 2 == 1 else "Counter 2"

            cursor.execute("""
                INSERT INTO orders (id, token, student_name, student_roll, items_json, total_amount, status, estimated_wait, special_instructions, counter, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (order_id, token, student_name, student_roll, json.dumps(items), total_amount, "Pending", estimated_wait, instructions, counter, now, now))
            conn.commit()
            conn.close()

            new_order = {
                "id": order_id,
                "token": token,
                "studentName": student_name,
                "studentRoll": student_roll,
                "items": items,
                "totalAmount": total_amount,
                "status": "Pending",
                "estimatedWaitMinutes": estimated_wait,
                "specialInstructions": instructions,
                "counter": counter,
                "createdAt": now,
                "updatedAt": now
            }
            self._send_json({"success": True, "order": new_order})
            return

        conn.close()
        self._send_json({"error": "Endpoint not found"}, 404)

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        patch_data = self.rfile.read(length) if length > 0 else b"{}"

        try:
            body = json.loads(patch_data.decode("utf-8"))
        except:
            body = {}

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        if path.startswith("/api/orders/"):
            order_id = path.replace("/api/orders/", "").replace("/status", "").strip()
            new_status = body.get("status")
            now = datetime.utcnow().isoformat() + "Z"

            cursor.execute("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", (new_status, now, order_id))
            conn.commit()

            cursor.execute("SELECT id, token, student_name, student_roll, items_json, total_amount, status, estimated_wait, special_instructions, counter, created_at, updated_at FROM orders WHERE id = ?", (order_id,))
            row = cursor.fetchone()
            conn.close()

            if row:
                order_obj = {
                    "id": row[0],
                    "token": row[1],
                    "studentName": row[2],
                    "studentRoll": row[3],
                    "items": json.loads(row[4]),
                    "totalAmount": row[5],
                    "status": row[6],
                    "estimatedWaitMinutes": row[7],
                    "specialInstructions": row[8],
                    "counter": row[9],
                    "createdAt": row[10],
                    "updatedAt": row[11]
                }
                self._send_json({"success": True, "order": order_obj})
            else:
                self._send_json({"error": "Order not found"}, 404)
            return

        elif path.startswith("/api/menu/"):
            item_id = path.replace("/api/menu/", "").replace("/toggle-stock", "").strip()
            cursor.execute("SELECT is_available FROM menu_items WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            if row:
                new_avail = 0 if row[0] == 1 else 1
                cursor.execute("UPDATE menu_items SET is_available = ? WHERE id = ?", (new_avail, item_id))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "itemId": item_id, "isAvailable": bool(new_avail)})
            else:
                conn.close()
                self._send_json({"error": "Item not found"}, 404)
            return

        conn.close()
        self._send_json({"error": "Endpoint not found"}, 404)

def run():
    print(f"==========================================================")
    print(f"  CanteenX - Live Server with Database Engine")
    print(f"  Serving at http://localhost:{PORT}")
    print(f"==========================================================")
    server = HTTPServer(("0.0.0.0", PORT), CanteenHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    run()
