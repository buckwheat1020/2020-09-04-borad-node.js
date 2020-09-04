const {pool, mysqlErr} = require('./mysql-conn');

module.exports = (req, localPath, tbName, where='WHERE 1') => {
	return new Promise(async (resolve, reject) => {
		let sql, connect, result, pager = {};
		try{
			sql = `SELECT COUNT(*) FROM ${tbName} ${where}`;
			connect = await pool.getConnection();
			result = await connect.execute(sql);
			connect.release();
			pager.path = localPath;
			pager.totalRec = result[0][0]['COUNT(*)'];
			pager.page = Number(req.params.page || 1);
			pager.cnt = Number(req.query.cnt || 5);
			pager.grp = Number(req.query.grp || 3);
			pager.page = pager.page || 1;
			pager.cnt = pager.cnt || 5;
			pager.grp = pager.grp || 3;
			pager.stRec = (pager.page - 1) * pager.cnt;
			pager.lastPage = Math.ceil(pager.totalRec / pager.cnt);
			pager.grpSt = Math.floor((pager.page - 1) / pager.grp) * pager.grp + 1;
			pager.grpEd = pager.grpSt + pager.grp - 1;
			pager.grpEd = pager.grpEd < pager.lastPage ? pager.grpEd : pager.lastPage; 
			pager.prev = pager.page > 1 ? pager.page - 1 : 1;
			pager.next = pager.page < pager.lastPage ? pager.page + 1 : pager.lastPage;
			resolve(pager);
		}
		catch(e){
			reject(e);
		}
	});
}

