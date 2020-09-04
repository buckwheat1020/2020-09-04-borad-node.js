const express = require('express');
const router = express.Router();
const { pool, mysqlErr, queryExecute } = require('../modules/mysql-conn');
const moment = require('moment');
const pagerInit = require('../modules/pager-conn');
const { alert } = require('../modules/util');
const { isAdmin, isUser, isGuest } = require('../modules/auth');
let connect, sql, sqlVal, result, pager;

router.get(['/', '/list', '/list/:page'], async (req, res, next) => {
	pager = await pagerInit(req, '/gbook/list', 'gbook');
	sql = 'SELECT * FROM gbook ORDER BY id DESC LIMIT ?, ?';
	sqlVal = [pager.stRec, pager.cnt];
	result = await queryExecute(sql, sqlVal);
	for(let v of result) v.createdAt = moment(v.createdAt).format('YYYY-MM-DD hh:mm:ss');
	const pug = { css: 'gbook', js: 'gbook', lists: result, pager };
	res.render('gbook/gbook.pug', pug);
});

router.post('/save', async (req, res, next) => {
	let { writer, comment } = req.body;
	sql = 'INSERT INTO gbook SET writer=?, comment=?';
	result = queryExecute(sql, [writer, comment]);
	res.redirect('/gbook/');
});

router.get('/rev/:id', isAdmin, async (req, res, next) => {
	let id = req.params.id;
	let page = req.query.page;
	sql = 'DELETE FROM gbook WHERE id='+id;
	result = await queryExecute(sql);
	res.redirect('/gbook/list/'+page);
});

module.exports = router;