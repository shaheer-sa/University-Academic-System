const express = require('express');
const router = express.Router();
const db = require('../System_Settings/database');

// Login page
router.get('/login', (req, res) => {
    const message = req.query.message || '';
    res.render('login', { message });
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { message: 'Please enter username and password' });
    }

    try {
        const result = await db.executeQuery(
            `SELECT user_id, username, role, ref_id 
             FROM APP_USERS 
             WHERE UPPER(username) = UPPER(:username) AND password = :password
               AND UPPER(TRIM(status)) = 'ACTIVE'`,
            [username, password]
        );

        if (result.rows && result.rows.length > 0) {
            const user = result.rows[0];
            // Oracle returns column names in UPPERCASE with OUT_FORMAT_OBJECT
            const role = user.ROLE || user.role;
            const userId = user.USER_ID || user.user_id;
            const userName = user.USERNAME || user.username;
            const refId = user.REF_ID || user.ref_id;

            req.session.user = {
                id: userId,
                username: userName,
                role: role,
                ref_id: refId
            };
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.render('login', { message: 'Session error. Try again.' });
                }
                
                // Redirect based on role
                if (role === 'ADMIN') {
                    res.redirect('/admin/dashboard');
                } else if (role === 'INSTRUCTOR') {
                    res.redirect('/teacher/dashboard');
                } else if (role === 'STUDENT') {
                    res.redirect('/student/dashboard');
                } else {
                    // Fallback — unknown role, don't hang
                    res.render('login', { message: '❌ Unknown role: ' + role + '. Contact admin.' });
                }
            });
        } else {
            res.render('login', { message: '❌ Invalid username or password' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { message: 'Database error. Try again.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Logout error');
        }
        res.redirect('/login?message=You have been logged out');
    });
});

module.exports = router;
