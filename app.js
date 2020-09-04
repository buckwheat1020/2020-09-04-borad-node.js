/*********************************************************** 외부모듈 */
const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
require('dotenv').config();
const session = require('./modules/session.conn');
const logger = require('./modules/morgan.conn');
const passportModule = require('./passport');

/********************************************************* 사용자모듈 */
const navi = require('./modules/navi.conn');


/*********************************************************** 절대경로 */
const publicPath = path.join(__dirname, './public');
const uploadPath = path.join(__dirname, './storage');
const viewsPath = path.join(__dirname, './views');

/*********************************************************** 세션/쿠키 */
app.set('trust proxy', 1) // trust first proxy
app.use(session);

/************************************************************* router */
const boardRouter = require('./router/board-router');
const memberRouter = require('./router/member-router');
const gbookRouter = require('./router/gbook-router');
const gbookRouterApi = require('./router/gbook-api-router');
const galleryRouter = require('./router/gallery-router');

/*********************************************************** 서버실행 */
app.listen(process.env.PORT, () => { console.log(`http://127.0.0.1:${process.env.PORT}`) });

/******************************************************** view engine */
app.set('view engine', 'pug');
app.set('views', viewsPath);
app.locals.pretty = true;
app.locals.headTitle = 'Node/Express'; // pug에게 보내는 전역변수
app.locals.navis = navi;

/*********************************** AJAX/POST 데이터를 json으로 변경 */
/* 이 줄을 써야 json으로 받을 수 있다. */
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/****************************************************** passport Init */
passportModule(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
	// app.locals.user = req.session.user ? req.session.user : {};
	app.locals.user = req.user ? req.user : {};
	next();
});


/*********************************************** logger (morgan) Init */
app.use(logger);

/***************************************************** router setting */
app.use('/', express.static(publicPath));
app.use('/upload', express.static(uploadPath));
app.use('/gbook', gbookRouter);
app.use('/gbook/api', gbookRouterApi);
app.use('/board', boardRouter);
app.use('/member', memberRouter);
app.use('/gallery', galleryRouter);

/************************************************************** erorr */
app.use((req, res, next) => {
	const err = new Error();
	err.code = 404;
	err.msg = '요청하신 페이지를 찾을 수 없습니다.';
	next(err);
});

app.use((error, req, res, next) => {
	if(error.code !== 404) console.log(error);
	const code = error.code || 500;
	const msg = error.msg || '서버 내부 오류 입니다. 관리자에게 문의하세요.';
	res.render('error.pug', { code, msg });
});