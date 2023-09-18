const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const crypto = require("node:crypto");

const { User } = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");

const { SECRET_KEY, PORT } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email);
  
  const verificationToken = crypto.randomUUID();

  const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken, });

   const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${PORT}/users/verify/${verificationToken}">To confirm your registration, please click this link</a>`,
    text: `
    To confirm your registration, please click this link\n
    ${PORT}/users/verify/${verificationToken}
    `,
  };

  await sendEmail(verifyEmail);
  
  //  await sendEmail({
  //     to: newUser.email,
  //     subject: "To verify your email",
  //     html: `
  //     <p>To confirm your registration, please click on link below</p>
  //     <p>
  //       <a href="http://localhost:${PORT}/users/verify/${verificationToken}">Click me</a>
  //     </p>
  //     `,
  //     text: `
  //       To confirm your registration, please click on link below\n
  //       http://localhost:${PORT}/users/verify/${verificationToken}
  //     `,
  //   });

    res.status(201).json({
        user: { email: newUser.email, subscription: newUser.subscription },
    });
};


const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
  };

  if (user.verify !== true) {
    throw HttpError(401, "Please verify your email");
  }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
        token,
        user: {
            email: user.email,
            subscription: user.subscription,
        },
    });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;

  console.log(req.user);

  const result = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json({ message: "subscription updated" });
};

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
     const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);

     await Jimp.read(resultUpload)
    .then((avatar) => {
      avatar.resize(250, 250).write(resultUpload);
    })
    .catch((err) => {
      console.error(err);
    });
    
    const avatarURL = path.join("avatars", filename);

    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
        avatarURL,
    });
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const returnVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${PORT}/users/verify/${user.verificationToken}">To confirm your registration, please click this link</a>`,
    text: `
    To confirm your registration, please click this link\n
    ${PORT}/users/verify/${user.verificationToken}
    `,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};


module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
    verify: ctrlWrapper(verify),
    returnVerify: ctrlWrapper(returnVerify),
}