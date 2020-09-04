module.exports = (pager) => {
	pager.page = pager.page || 1;		// 현재페이지
	pager.cnt = pager.cnt || 5;			// 한페이지당 리스트 수
	pager.grp = pager.grp || 3;			// 페이저 그룹 갯수
	pager.stRec = (pager.page - 1) * pager.cnt;
	pager.lastPage = Math.ceil(pager.totalRec / pager.cnt);
	pager.grpSt = Math.floor((pager.page - 1) / pager.grp) * pager.grp + 1;
	pager.grpEd = pager.grpSt + pager.grp - 1;
	pager.grpEd = pager.grpEd < pager.lastPage ? pager.grpEd : pager.lastPage; 
	pager.prev = pager.page > 1 ? pager.page - 1 : 1;
	pager.next = pager.page < pager.lastPage ? pager.page + 1 : pager.lastPage;

	return pager;
}

