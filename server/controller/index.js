const Router = require('express').Router;
const router = Router();

const auth = require('../filter/auth');
router.use(auth);

const testModels = require('../models/test');


router.get('/', (req, res, next) => {
    proxy(req)({
        api: 'test',
        type: 'post',
        url: '/test'
    }).then((a)=>{
        return testModels.select(req, {
            id: a
        })
    }).then(()=>{
        res.render('index');
    }).catch((err)=>{
        res.render('index');
    })
    
});

module.exports = router;