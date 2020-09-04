const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {pool , mysqlErr, fileRev, queryExecute, storagePath, uploadPath} = require('../modules/mysql-conn');
const { upload } = require('../modules/muter-conn');
const pagerInit = require('../modules/pager-conn');
const { isAdmin, isUser, isUserApi, isGuest, isMine } = require('../modules/auth');
const { alert } = require('../modules/util')

const pug = {css: "gallery", js: "gallery"};
let sql, sqlVal = [], result, pager;

router.get(['/', '/li', '/li/:page'], async (req, res, next) => {
	pug.title = '갤러리 리스트'
	try{
		req.query.cnt = req.query.cnt || 15;
		pager = await pagerInit(req, '/gallery/li', 'gallery');
		sql = 'SELECT * FROM gallery ORDER BY id DESC LIMIT ?,?';
		sqlVal = [pager.stRec, pager.cnt];
		result = await queryExecute(sql, sqlVal);
		pug.pager = pager;
		pug.lists = result;
		for(let v of pug.lists) {
			v.src = '//via.placeholder.com/300'
			v.src2 = '//via.placeholder.com/300'
			if(v.savefile || v.savefile == ''){
				v.src = uploadPath(v.savefile);
				v.src2 = v.src;
			}
			if(v.savefile2 || v.savefile2 == ''){
				v.src2 = uploadPath(v.savefile2);
			}
		}
		res.render('gallery/gallery-li.pug', pug);
	}
	catch(e){
		next(e);
	}
});

router.get(['/wr', '/wr/:id'], async (req, res, next) => {
	let id = req.params.id
	try{
		if(!id) {
			pug.title = '갤러리 등록'
			pug.list = null;
		}
		else {
			pug.title = '갤러리 수정'
			sql = 'SELECT * FROM gallery WHERE id='+id;
			result = await queryExecute(sql);
			pug.list = result[0];
			if(pug.list.savefile){
				pug.list.src = uploadPath(pug.list.savefile);
			}
			if(pug.list.savefile2){
				pug.list.src2 = uploadPath(pug.list.savefile2);
			}
		}
		res.render('gallery/gallery-wr.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.get('/view/:id', async (req, res, next) => {
	let id = req.params.id;
	try{
		sql = 'SELECT * FROM gallery WHERE id='+id;
		result = await queryExecute(sql);
		res.json(result[0]);
	}
	catch(e) {
		next(e);
	}
});

router.get('/rev/:id', isUser, async (req, res, next) => {
	try {
		let id = req.params.id;
		let savefile = req.query.savefile;
		let savefile2 = req.query.savefile2;
		if(savefile) await fileRev(savefile);
		if(savefile2) await fileRev(savefile2);
		sql = `DELETE FROM gallery WHERE id=${id} AND uid=${req.session.user.id}`;
		await queryExecute(sql);
		if(result.affectedRows > 0 ) res.redirect('/gallery');
		else res.send(alert('본인의 글만 수정하실 수 있습니다', '/'));
	}
	catch(e) {
		next(e);
	}
});

router.get('/download/:id', async (req, res, next) => {
	let id = req.params.id;
	let seq = req.query.seq;
	let savefile, realfile;
	try {
		sql = `SELECT savefile${seq}, realfile${seq} FROM gallery WHERE id=${id}`;
		result = await queryExecute(sql);
		savefile = result[0][`savefile${seq}`];
		realfile = result[0][`realfile${seq}`];
		savefile = storagePath(savefile);
		res.download(savefile, realfile);
	}
	catch(e) {
		next(e);
	}
});


router.post('/save', isUser, upload.fields([{name: 'upfile'}, {name: 'upfile2'}]), isMine, async (req, res, next) => {
	sqlVal = [];
	let { id, savefile, savefile2, title, writer, content } = req.body;
	if(req.banExt) res.send(`<script>alert('${req.banExt} 타입은 업로드 할 수 없습니다.')</script>`);
	else {
		try {
			sqlVal[0] = title;
			sqlVal[1] = writer;
			sqlVal[2] = content;
			if(id) sql = 'UPDATE gallery SET title=?, writer=?, content=?';
			else sql = 'INSERT INTO gallery SET title=?, writer=?, content=?';
			if(req.files['upfile']) {
				if(id && savefile) await fileRev(savefile);
				sql += ', realfile=?, savefile=?';
				sqlVal.push(req.files['upfile'][0].originalname);
				sqlVal.push(req.files['upfile'][0].filename);
			}
			if(req.files['upfile2']) {
				if(id && savefile2) await fileRev(savefile2);
				sql += ', realfile2=?, savefile2=?';
				sqlVal.push(req.files['upfile2'][0].originalname);
				sqlVal.push(req.files['upfile2'][0].filename);
			}
			sqlVal.push(req.session.user.id);
			if(id) sql += ' WHERE uid=? AND id='+id;
			else sql += ', uid=?'
			result = await queryExecute(sql, sqlVal);
			if(result.affectedRows > 0 ) res.redirect('/gallery');
			else res.send(alert('본인의 글만 수정하실 수 있습니다', '/'));
		}
		catch(e) {
			next(e);
		}
	}
});

router.get('/api-img/:id', isUserApi, async (req, res, next) => {
	try{
		let id = req.params.id;
		let { n, file } = req.query;
		sql = `UPDATE gallery SET savefile${n}=NULL, realfile${n}=NULL WHERE id=${id} AND uid=${req.session.user.id}`;
		result = await queryExecute(sql);
		if(result.affectedRows > 0){
			result = await fileRev(file);
			res.json({code: 200, result});
		}
		else{
			res.json({error : {code: 500, msg: '본인의 글만 삭제하실 수 있습니다.'}})
		}
	}
	catch(e){
		res.json(e);
	}
});

module.exports = router;