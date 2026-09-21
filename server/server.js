const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'foxtashin-super-secret-key-change-me-later';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'recruiter'
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
        });
        console.log('Connected to the SQLite database and ensured tables exist.');
    }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Пожалуйста, введите логин и пароль' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            message: 'Успешный вход',
            token: token,
            username: user.username,
            role: user.role
        });
    });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Токен не предоставлен' });
    
    // Remove "Bearer " if present
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Неверный токен' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.username = decoded.username;
        next();
    });
};

// Get current user info (for navigation rendering)
app.get('/api/me', verifyToken, (req, res) => {
    res.status(200).json({
        id: req.userId,
        username: req.username,
        role: req.userRole
    });
});

// Log an activity
app.post('/api/activities', verifyToken, (req, res) => {
    const { type, description } = req.body;
    
    if (!type) {
        return res.status(400).json({ message: 'Укажите тип активности' });
    }

    db.run(
        `INSERT INTO activities (user_id, type, description) VALUES (?, ?, ?)`,
        [req.userId, type, description || ''],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Ошибка сервера при сохранении активности' });
            }
            res.status(201).json({ message: 'Активность успешно сохранена', activityId: this.lastID });
        }
    );
});

// Get activities (recruiter sees their own, chief sees all)
app.get('/api/activities', verifyToken, (req, res) => {
    if (req.userRole === 'chief') {
        db.all(
            `SELECT activities.*, users.username FROM activities JOIN users ON activities.user_id = users.id ORDER BY date DESC`,
            [],
            (err, rows) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера' });
                res.status(200).json(rows);
            }
        );
    } else {
        db.all(
            `SELECT activities.*, users.username FROM activities JOIN users ON activities.user_id = users.id WHERE user_id = ? ORDER BY date DESC`,
            [req.userId],
            (err, rows) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера' });
                res.status(200).json(rows);
            }
        );
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
