const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// payload
const payload = {
    id: 1,
    nome: "admin",
    role: "admin"
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });

console.log("TOKEN GERADO:");
console.log(token);
