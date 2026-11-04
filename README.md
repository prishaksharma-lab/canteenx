# CanteenX – Smart Canteen Ordering & Queue Management System

A web application for college campus canteens that eliminates lunch-break queues through smart digital pre-ordering, live kitchen queue tracking, automated rush-hour pause management, and comprehensive **MERN Full-Stack & MongoDB integration** covering the course syllabus.

---

## 1. Executive Summary & Problem-Solution Fit

### The Campus Problem
During 30-to-45-minute college lunch breaks:
* Hundreds of students rush to the canteen at the exact same time.
* Students spend 20+ minutes in crowded queues, leaving inadequate break time.
* Kitchen staff struggle to manage chaotic handwritten or verbal order queues.
* Students often reach the counter only to discover that popular items (e.g. samosas, wraps) are sold out.

### The CanteenX Solution
* **Student Pre-Ordering**: Students order ahead from classroom or dorm.
* **Smart Digital Tokens**: Every order receives an atomic token (`#CX-101`, `#CX-102`) assigned to Counter 1 or 2.
* **Live Order Progression**: Real-time status advancement (`Pending` $\to$ `Preparing` $\to$ `Ready for Pickup` $\to$ `Collected`).
* **Dynamic Wait Time Estimator**: Based on the active order backlog.
* **Rush-Hour Control**: Kitchen can temporarily pause new orders when overloaded.

---

## 2. Full-Stack Course Syllabus Coverage Matrix (Modules 1 – 6)

The project directly implements and demonstrates **100% of all 6 modules** of the course syllabus:

| Module | Title & Hours | Topics Implemented in CanteenX | Primary File References |
| :---: | :--- | :--- | :--- |
| **1** | **Web Programming Fundamentals** *(5 Hours)* | • Browser DOM manipulation & event loop<br>• HTTP/HTTPS methods (`GET`, `POST`, `PATCH`)<br>• DNS & TLS handshake concepts<br>• JSON payload parsing & XML data representation<br>• RESTful URI endpoints & status codes (`200`, `201`, `400`, `403`, `404`) | • [`server.py`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/server.py)<br>• [`server.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/server.js)<br>• [`canteenx.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/assets/canteenx.js) |
| **2** | **JavaScript Modern Core** *(6 Hours)* | • ES6 Classes & Inheritance (`class OrderModel`)<br>• Generator functions for atomic token sequences (`function* tokenGenerator`)<br>• Promises, `async/await`, Fetch API client<br>• Built-in browser objects, Event handling, DOM methods<br>• Form validation with RegExp & Cookies/LocalStorage persistence | • [`assets/canteenx.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/assets/canteenx.js)<br>• [`orderController.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/controllers/orderController.js) |
| **3** | **React Fundamentals & Advanced** *(10 Hours)* | • Components (`StudentDashboard`, `KitchenAdmin`, `CounterBoard`)<br>• State & Props (`useState`, `useEffect`)<br>• Advanced hooks: `useContext` (`CanteenContext`), `useReducer`<br>• Custom hooks (`useQueueTimer`, `useSoundNotification`)<br>• List keys, conditional rendering, performance memoization (`useMemo`, `useCallback`) | • [`App.jsx`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/frontend/src/App.jsx)<br>• [`CanteenContext.jsx`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/frontend/src/context/CanteenContext.jsx)<br>• [`StudentDashboard.jsx`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/frontend/src/components/StudentDashboard.jsx) |
| **4** | **Node.js Core Runtime** *(6 Hours)* | • Node.js runtime, asynchronous I/O & event loop<br>• `EventEmitter` for kitchen audio/queue event bus<br>• Memory `Buffer` manipulation & data packets<br>• `Stream` processing (`fs.createReadStream.pipe(res)`)<br>• **Native HTTP Server built WITHOUT Express** (`nativeHttpServer.js`)<br>• `fs` and `path` cross-platform resolution | • [`nativeHttpServer.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/nativeHttpServer.js)<br>• [`package.json`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/package.json) |
| **5** | **Express.js Framework** *(6 Hours)* | • Express Router modules (`orderRoutes`, `menuRoutes`, `authRoutes`)<br>• RESTful CRUD design<br>• Middleware pipeline (CORS, body-parser, custom request logger)<br>• Centralized error-handling middleware (`notFound`, `errorHandler`)<br>• JWT authentication & `bcryptjs` password hashing | • [`server.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/server.js)<br>• [`authMiddleware.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/middleware/authMiddleware.js)<br>• [`loggerMiddleware.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/middleware/loggerMiddleware.js) |
| **6** | **Databases (MongoDB/Mongoose) & Full-Stack Integration** *(6 Hours)* | • **NoSQL MongoDB + Mongoose ODM**<br>• Schemas with validators, indexes, subdocuments, and pre-save hooks<br>• **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$sum`, `$sort`) for peak-hour analytics<br>• Database Seeder script (`seed.js`) & MongoDB Atlas URI support<br>• Environment variables (`.env.example`)<br>• Deployment manifests (`vercel.json` for frontend, `render.yaml` for backend) | • [`db.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/config/db.js)<br>• [`Order.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/models/Order.js)<br>• [`MenuItem.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/models/MenuItem.js)<br>• [`seed.js`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/backend/seed.js)<br>• [`vercel.json`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/vercel.json)<br>• [`render.yaml`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/course_project_files/render.yaml) |

---

## 3. MongoDB & Mongoose Architecture

### Database Schema Structure:
* **`User` Collection (`users`)**:
  * Fields: `name`, `email` (unique), `rollNumber`, `password` (bcrypt hashed), `role` (`student` | `kitchen_staff` | `admin`).
* **`MenuItem` Collection (`menuitems`)**:
  * Fields: `name`, `category` (enum), `price`, `prepTime`, `isAvailable` (boolean), `diet` (`Veg` | `Vegan` | `Non-Veg`), `calories`, `image`.
  * Index: `{ category: 1, isAvailable: 1 }` for rapid menu filtering.
* **`Order` Collection (`orders`)**:
  * Fields: `token` (`#CX-...`, unique index), `student` (ObjectId reference to `User`), `studentName`, `studentRoll`, `items` (subdocument array), `totalAmount`, `status` (`Pending` | `Preparing` | `Ready` | `Collected`), `estimatedWaitMinutes`, `specialInstructions`, `counter`.
* **MongoDB Aggregation Pipeline** (Module 6 peak-hour analysis):
  ```javascript
  Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: { $hour: '$createdAt' }, orderCount: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
    { $sort: { _id: 1 } }
  ]);
  ```

---

## 4. Classy Editorial UI Design

* **Typography**:
  * **Headings**: *Playfair Display* — refined, editorial serif with luxury warmth.
  * **Body & Numbers**: *Plus Jakarta Sans* — modern, high-legibility geometric sans.
  * **Tokens & Database IDs**: *JetBrains Mono* — crisp monospace font.
* **Zero Red/Green Good/Bad Clichés**:
  * **Pending**: Warm Honey Ochre (`#B45309`)
  * **Preparing**: Spiced Copper Clay (`#C25E38`)
  * **Ready for Pickup**: Royal Cobalt Iris (`#4338CA`) — *High visibility, zero green!*
  * **Collected**: Muted Ash Slate (`#52525B`)
  * **Sold Out**: Warm Charcoal Slate Badge with strikethrough.
* **Proper Light/Dark Mode**: Smooth transition between Warm Alabaster (`#FAF7F2`) and Deep Obsidian Espresso (`#121110`).

---

## 5. How to Run

### Method 1: Instant Browser Launch (Zero Installation)
Double click [`open_in_browser.bat`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/open_in_browser.bat) or open [`index.html`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/index.html).

### Method 2: Python Local Server
Double click [`start_canteenx.bat`](file:///C:/Users/Prisha/.gemini/antigravity/scratch/canteenx/start_canteenx.bat) or run:
```powershell
python C:\Users\Prisha\.gemini\antigravity\scratch\canteenx\server.py
```
Open **`http://localhost:8000`** in your browser.

### Method 3: Node.js & Express + MongoDB Backend
```powershell
cd C:\Users\Prisha\.gemini\antigravity\scratch\canteenx\course_project_files\backend
npm install
node seed.js    # Seeds MongoDB with campus data
npm start       # Starts Express + Socket.IO server on port 5000
```

### Method 4: Native Node.js HTTP Server (Without Express - Module 4)
```powershell
cd C:\Users\Prisha\.gemini\antigravity\scratch\canteenx\course_project_files\backend
node nativeHttpServer.js
```
