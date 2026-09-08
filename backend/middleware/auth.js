const jwt=require('jsonwebtoken');
module.exports=(req,res,next)=>{try{const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)return res.status(401).json({message:'Authentication required'});req.user=jwt.verify(token,process.env.JWT_SECRET||'soru-dev-secret');next();}catch(e){res.status(401).json({message:'Invalid or expired session'});}};
