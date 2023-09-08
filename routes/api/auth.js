const express = require("express");

const cntrl = require("../../controllers/auth");

const { validateBody, validateCoreBody, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();


router.post("/register", validateCoreBody(schemas.registerSchema), cntrl.register);

router.post("/login", validateCoreBody(schemas.loginSchema), cntrl.login);

router.get("/current", authenticate, cntrl.getCurrent);

router.post("/logout", authenticate, cntrl.logout);

router.patch( "/", authenticate, validateBody(schemas.updateSubscripSchema), cntrl.updateSubscription);

module.exports = router;