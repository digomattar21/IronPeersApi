


module.exports = (req, res, next) => {
  const jwt= require('jsonwebtoken');
  const token = req.get('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'req sem token' });
  }
  const tokenWithoutBearer = token.split(' ')[1];
  console.log(tokenWithoutBearer)
  try {
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_PASS);
    req.user = { id: decodedToken.id, username: decodedToken.username };
    return next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
