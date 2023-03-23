'use strict'
const express = require('express');
const ejs = require('ejs');
const app = express();
const db = require('./models');
const bodyParser = require('body-parser');//post방식 사용하기 위해서 필요
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

app.use(session({
    secret:"@#@$MYSIGN#@$#$",
    resave:false,
    saveUninitialized:true,
}))

app.use(methodOverride('_method'));

app.use('/images',express.static('images'));

const storage = multer.diskStorage({
    destination:(req,file,cd)=>{
        cd(null,'./images');
    },
    filename:function nm(req,file,cd){
        const newFileName = Math.random().toString(36).substring(2,12)+'.jpg';
        file.originalname = Buffer.from(newFileName,'latin1').toString('utf8');
        console.log(newFileName)
        cd(null,newFileName);
    }
})

const upload = multer({storage: storage});
const {UserInfo} = db;
const {sefemployed} = db;
const {rtInfo} = db;
const {waiting} = db;


app.set('views','./src/views');
app.set('view engine','ejs');

app.use(express.static(`${__dirname}/src/public`));

app.use(express.json());
app.use(bodyParser.urlencoded({extend:false}));//use를 통해 연결시킨다.

//홈
app.get('/',async(req,res)=>{

    const sess = req.session;
    const mynumber = await waiting.findOne({where:{id : sess.userid ? sess.userid:'a'}});
    const ko = await rtInfo.findAll({where: { type: '한식'}, limit:5});
    const ch = await rtInfo.findAll({where: { type: '중식'}});
    const jp = await rtInfo.findAll({where: { type: '일식'}});
    const hb = await rtInfo.findAll({where: { type: '햄버거'}});
    const pz = await rtInfo.findAll({where: { type: '피자'}});
    const ck = await rtInfo.findAll({where: { type: '치킨'}});
    const etc = await rtInfo.findAll({where: { type: '기타'}});
    const number = mynumber ? mynumber.waitingnum : false;
    res.render('index.ejs',{
        id:sess.userid,
        mynumber: number ? mynumber.waitingnum : 0,
        ko: ko,
        ch: ch,
        jp: jp,
        hb: hb,
        pz: pz,
        ck: ck,
        etc: etc

    });
})

//회원가입
app.get('/register',(req,res)=>{
    res.render('register.ejs');
})


app.post('/register',async(req,res)=>{
    const newUser = req.body;
    const semploy =  await sefemployed.findOne({where:{id:newUser.id}});
    const user = await UserInfo.findOne({where:{id:newUser.id}});
    if(semploy){
        res.status(404).send({message:'아이디가 중복됩니다.'});
    }else if(user){
        res.status(404).send({message:'아이디가 중복됩니다.'});
    }else if(newUser.employ){
        const employ = sefemployed.build(newUser);
        await employ.save();
        res.redirect(`/rtinfo?newUser=${newUser.id}`);
        
    }else{
        await UserInfo.create(newUser);
        res.redirect('/');
    }
    
})

app.get('/rtinfo',async(req,res)=>{
    const {newUser} = req.query;
    res.render('rtinfo.ejs',{
        newUser:newUser
    });
})

app.post('/rtinfo',async(req,res)=>{
    const rsInfo = req.body;
    console.log(rsInfo.id);
   
    
    const rsinfo ={
        restaurantname:rsInfo.restaurantname,
        type: rsInfo.type,
        restaurantaddress:rsInfo.address+' '+rsInfo.address_detail,
        explantion:rsInfo.explantion,
    }
    const info = await rtInfo.create(rsinfo);

    if(info){
        const user = await sefemployed.findOne({where: { id: rsInfo.id}})
        const newUser = {
            id: user.id,
            password: user.password,
            name:user.name,
            birth:user.birth,
            phonnum:user.phonnum,
            email:user.email,
            resnum:info.resnum
        }
        await sefemployed.update(newUser,{where:{id : user.id}});
    }
    res.redirect('/');
})

//로그인
app.get('/login',async(req,res)=>{
    res.render('login.ejs');
})

app.post('/login',async(req,res)=>{
    sess = req.session;
    const id = req.body.id;
    const password = req.body.password;
    
    const user = await UserInfo.findOne(({where: {id}}));
    const employ = await sefemployed.findOne(({where:{id}}));
    if(user){
        if(user.password == password){
            sess.userid = user.id;
            console.log(sess.userid);
        }else{
            res.status(404).send({message: 'wrong password'});
        }
    }else if(employ){
        if(employ.password == password){
            sess.userid = employ.id;
        }else{
            res.status(404).send({message: 'wrong password'});
        }
    }
    else{
        res.status(404).send({message: 'wrong password'});
    }
    res.redirect('/');
})

app.get('/logout',async(req,res)=>{
    sess = req.session;
    if(sess.id){
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        })
    }else{
        res.redirect('/');
    }
})

//예약
app.get('/waiting/:resnum',async(req,res)=>{
    const resnum = req.params.resnum;
    const sess = req.session;
    const today = new Date();
    try{
        
        const createAt = await waiting.findOne({order:[['date']]});
        const date = today.getDate();
        console.log(date);
        if(createAt && createAt.date != date){
            await waiting.destroy({where:{resnum}});
        }
        const reswaiting = await waiting.findOne({where: {resnum}, order:[['waitingnum','DESC']]});
        
        const wt = reswaiting ? reswaiting.waitingnum : 0;
        const mynumber = await waiting.findOne({
            where:{
                id : sess.userid,
                tf:false,
                resnum:resnum
            }
        });
        const number = mynumber ? mynumber : 'not'
        console.log(wt);
        res.render('waiting.ejs',{
            people:wt,
            number:number,
            resnum:resnum,
            id:sess.userid,
            date:date,
        });
    }catch(err){
        console.log(err);
        res.redirect('/login');
    }
    
})
app.post('/waiting',async(req,res)=>{
    const Waiting = req.body;
    await waiting.create(Waiting)
    res.redirect('/');
})

//mypage
app.get('/mypage/:id',async(req,res)=>{
    const {id} = req.params;

    res.render('mypage.ejs',{
        id:id
    });
})

app.put('/upload/rtpicture/:id',upload.single('img'),async(req,res)=>{
    const {id} = req.params;
    const employ = await sefemployed.findOne({where: {id}});
    const pictureBool = await rtInfo.findOne({where:{resnum: employ.resnum}});
    console.log(pictureBool.picture);
    if(pictureBool.picture){
        fs.unlinkSync('./images/'+pictureBool.picture);
    }
    const picture = req.file.originalname;
    console.log(picture);
    console.log(req.file);
    await rtInfo.update({picture:picture},{where: {resnum:employ.resnum}});
    res.redirect('/');
})


//test
app.get('/test/:id',async(req,res)=>{
    const {id} = req.params;
    const user = await UserInfo.findOne({where: {id}});
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'no user'});
    }
})
app.get('/test2',async(req,res)=>{
    const user = await sefemployed.findAll();
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'no user'});
    }
})
app.get('/test3/:resnum',async(req,res)=>{
    const {resnum} = req.params;
    const user = await waiting.findAll({where: {resnum}});
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'no user'});
    }
})

app.get('/test4',async(req,res)=>{
    const user = await rtInfo.findAll();
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'no user'});
    }
})

app.get('/testW',async(req,res)=>{
    const user = await waiting.findAll();
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'no user'});
    }
})

module.exports = app;