


module.exports = (req, res, next) => {
  const jwt= require('jsonwebtoken');
  const token = req.get('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'req sem token' });
  }
  const tokenWithoutBearer = token.split(' ')[1];
  try {
    console.log(token)
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_PASS);
    console.log(decodedToken);
    req.user = { id: decodedToken.id, username: decodedToken.username, email: decodedToken.email };
    return next();
  } catch (error) {
    console.log(' middleware' ,error.message);
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
