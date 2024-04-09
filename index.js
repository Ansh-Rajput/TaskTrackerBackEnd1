require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/conn");

const taskRoutes = require("./routes/taskRoutes");

const PORT = 8000;

const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./models/userSchema")

const clientid = process.env.GOOGLE_CLIENT_ID;
const clientsecret = process.env.GOOGLE_CLIENT_SECRET;


app.use(cors({
    origin: [`${process.env.FRONTEND_URL}`, '*'],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.json());

// setup session
app.use(session({
    secret: "7dfc5e32-9a81-4b1d-8e12-9c2a45f3a6e7",
    resave: false,
    saveUninitialized: true
}))

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

app.get("/getAllUsers", async (req, res) => {
    try {
        let users = await userdb.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "some error occured while connectiong to backend" });
    }
})

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await userdb.findOne({ googleId: profile.id });

                if (!user) {
                    user = new userdb({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value
                    });

                    await user.save();
                }

                return done(null, user)
            } catch (error) {
                return done(error, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
});

// initial google ouath login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL}`,
    failureRedirect: `${process.env.FRONTEND_URL}`
}))

app.get("/login/sucess", async (req, res) => {

    if (req.user) {
        res.status(200).json({ message: "user Login", user: req.user })
    } else {
        res.status(400).json({ message: "Not Authorized", user: null })
    }
})

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect(`${process.env.FRONTEND_URL}`);
    });
    console.log("working");
})


app.use('/tasks', taskRoutes);

app.listen(PORT, () => {
    console.log(`server start at port no ${PORT}`)
})