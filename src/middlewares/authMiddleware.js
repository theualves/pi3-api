import jwt from "jsonwebtoken";

export const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
   
const verificado = jwt.verify(token, process.env.JWT_SECRET);
    

    req.usuario = verificado;
    
    next(); 
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ou expirado." });
  }
};