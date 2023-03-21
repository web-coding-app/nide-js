const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Basket } = require("../models/models");

const generateTokenJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_JWT, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(req, res, next) {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest("Неправильный Email или пароль!!!"));
    }

    const condidate = await User.findOne({ where: { email } });

    if (condidate) {
      return next(
        ApiError.badRequest("Пользователь с таким Email уже существует!!!")
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const newUser = await User.create({ email, role, password: hashPassword });
    const basket = await Basket.create({ userId: newUser.id });
    const token = generateTokenJwt(newUser.id, newUser.email, newUser.role);
    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(ApiError.badRequest("Пользователь не существует!!!"));
    }

    let comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
      return next(ApiError.badRequest("Пароль введен неверно!!!"));
    }

    const token = generateTokenJwt(user.id, user.email, user.role);
    return res.json({ token });
  }

  async check(req, res, next) {
    const token = generateTokenJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
}

module.exports = new UserController();
