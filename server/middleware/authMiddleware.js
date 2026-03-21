const jwt = require("jsonwebtoken")

module.exports = function (req, res, next){
  if(req.method === "OPTIONS"){
    next()
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token){
      return res.status(401).json({message: "Не авторизован"})
    }

    const decoded = jwt.verify(
      token, 
      process.env.SECRET_KEY || "random_secret_key_123"
    )

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json("Не авторизован");
  }
}