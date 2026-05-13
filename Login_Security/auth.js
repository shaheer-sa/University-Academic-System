// Check if user is logged in
function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?message=Please login first');
    }
    next();
}

// Check if user is ADMIN
function checkAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?message=Please login first');
    }
    if (req.session.user.role !== 'ADMIN') {
        return res.status(403).render('error', { 
            message: 'Access Denied! Admin access required.',
            userRole: req.session.user.role 
        });
    }
    next();
}

// Check if user is INSTRUCTOR
function checkInstructor(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?message=Please login first');
    }
    if (req.session.user.role !== 'INSTRUCTOR') {
        return res.status(403).render('error', { 
            message: 'Access Denied! Instructor access required.',
            userRole: req.session.user.role 
        });
    }
    next();
}

// Check if user is STUDENT
function checkStudent(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?message=Please login first');
    }
    if (req.session.user.role !== 'STUDENT') {
        return res.status(403).render('error', { 
            message: 'Access Denied! Student access required.',
            userRole: req.session.user.role 
        });
    }
    next();
}

module.exports = {
    checkLogin,
    checkAdmin,
    checkInstructor,
    checkStudent
};
