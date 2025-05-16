const express = require('express');
const path = require('path');
const cors = require('cors');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const compression = require('compression');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API routes
app.post('/api/send-email', (req, res) => {
    const { name, company, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.FOLIO_EMAIL,
            pass: process.env.FOLIO_PASSWORD,
        },
    });

    transporter
        .verify()
        .then(() => {
            transporter
                .sendMail({
                    from: `"${name}" <henryheffernan.folio@gmail.com>`, // sender address
                    to: 'henryheffernan@gmail.com, henryheffernan.folio@gmail.com', // list of receivers
                    subject: `${name} <${email}> ${
                        company ? `from ${company}` : ''
                    } submitted a contact form`, // Subject line
                    text: `${message}`, // plain text body
                })
                .then((info) => {
                    console.log({ info });
                    res.json({ message: 'success' });
                })
                .catch((e) => {
                    console.error(e);
                    res.status(500).json({ error: e.message });
                });
        })
        .catch((e) => {
            console.error(e);
            res.status(500).json({ error: e.message });
        });
});

// Static file serving - moved all static middleware after API routes
app.use('/assets', express.static(path.resolve(__dirname, '../public/assets')));
app.use('/static', express.static(path.resolve(__dirname, '../public/static')));
app.use(express.static(path.resolve(__dirname, '../public')));

// Catch-all route must be last
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});