const { alert } = require('../modules/util');
const { queryExecute } = require('../modules/mysql-conn');

const isAdmin = (req, res, next) => {
	if(req.user.grade == 9) next();
	else res.send( alert('권한이 없습니다.', '/') );
}
const isUser = (req, res, next) => {
	if(req.isAuthenticated()) next();
	else res.send( alert('로그인 후 사용 가능합니다.', '/member/login') );
}
const isUserApi = (req, res, next) => {
	if(req.isAuthenticated()) next();
	else res.json({error: {code: 500, mas: '정상적인 접근이 아닙니다.'}} );
}
const isGuest = (req, res, next) => {
	if(!req.isAuthenticated())	next();
	else res.send( alert('정상적인 접근이 아닙니다. 로그아웃 후에 이용하세요.', '/') );
}
const isMine = async (req, res, next) => {
	let id = req.query.id || req.params.id || req.body.id;
	let uid = req.user.id;
	let sql = `SELECT * FROM gallery WHERE id=${id} AND uid=${uid}`;
	result = await queryExecute(sql);
	if(result.affectedRows > 0) next();
	else res.send(alert('본인의 글만 접근 가능합니다.', '/'));
}

module.exports = { isAdmin, isUser, isUserApi, isGuest, isMine };