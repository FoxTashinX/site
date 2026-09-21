const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
    console.log("Использование: node create_user.js <username> <password> [role]");
    process.exit(1);
}

const username = args[0];
const password = args[1];
const role = args[2] || 'recruiter';

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
        process.exit(1);
    }
});

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role], function(err) {
    if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            console.log(`Ошибка: Пользователь с логином "${username}" уже существует.`);
        } else {
            console.error('Ошибка при создании пользователя:', err.message);
        }
    } else {
        console.log(`Успех: Пользователь "${username}" с ролью "${role}" успешно создан!`);
    }
    db.close();
});
