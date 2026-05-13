const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'System_Screens'));

// Session configuration
app.use(session({
    secret: 'university_secret_key_2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Routes
const loginRoutes = require('./System_Navigation/User_Login_Portal');
const adminRoutes = require('./System_Navigation/Administrative_Controls');
const teacherRoutes = require('./System_Navigation/Instructor_Grade_System');
const studentRoutes = require('./System_Navigation/Student_View_System');

// Use routes
app.use('/', loginRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'ADMIN') {
            res.redirect('/admin/dashboard');
        } else if (req.session.user.role === 'INSTRUCTOR') {
            res.redirect('/teacher/dashboard');
        } else if (req.session.user.role === 'STUDENT') {
            res.redirect('/student/dashboard');
        }
    } else {
        res.redirect('/login');
    }
});

// Start server with a fallback if the default port is already taken.
const BASE_PORT = Number(process.env.PORT) || 3000;

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`🚀 University System running on http://localhost:${port}`);
        console.log(`📊 Login page: http://localhost:${port}/login`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
            return;
        }

        console.error('Server error:', err);
        process.exit(1);
    });
}

startServer(BASE_PORT);
