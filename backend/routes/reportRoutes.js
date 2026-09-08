const r=require('express').Router(),c=require('../controllers/reportController'),a=require('../middleware/auth');r.get('/',a,c.summary);module.exports=r;
