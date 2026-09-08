const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Category = require("../models/Category");
const Project = require("../models/Project");
const Transaction = require("../models/Transaction");
const Idea = require("../models/Idea");
const Schedule = require("../models/Schedule");
const defaults = [
  ["Project Income", "income"],
  ["Brand Deal", "income"],
  ["YouTube Revenue", "income"],
  ["Other Income", "income"],
  ["Travel", "expense"],
  ["Food", "expense"],
  ["Equipment", "expense"],
  ["Editing", "expense"],
  ["Promotion", "expense"],
  ["Other Expense", "expense"],
];
const token = (u) =>
  jwt.sign(
    { id: u._id, email: u.email },
    process.env.JWT_SECRET || "soru-dev-secret",
    { expiresIn: "7d" },
  );
const safe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  channelName: u.channelName,
  avatar: u.avatar,
  settings: u.settings,
});
exports.register = async (req, res) => {
  try {
    const { name, email, password, channelName } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    const u = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      channelName: channelName || "Soru Creator",
    });
    await Promise.all([
      Project.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Transaction.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Idea.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Schedule.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
    ]);
    await Category.insertMany(
      defaults.map(([name, type]) => ({ name, type, userId: u._id })),
    );
    res.status(201).json({ token: token(u), user: safe(u) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u || !(await bcrypt.compare(password, u.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    await Promise.all([
      Project.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Transaction.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Idea.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
      Schedule.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: u._id } },
      ),
    ]);
    res.json({ token: token(u), user: safe(u) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
exports.me = async (req, res) => {
  const u = await User.findById(req.user.id).select("-password");
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json(safe(u));
};
exports.update = async (req, res) => {
  try {
    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    if (req.body.name !== undefined) u.name = req.body.name;
    if (req.body.channelName !== undefined)
      u.channelName = req.body.channelName;
    if (req.body.avatar !== undefined) u.avatar = req.body.avatar;
    if (req.body.settings)
      u.settings = { ...u.settings.toObject(), ...req.body.settings };
    await u.save();
    res.json(safe(u));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
