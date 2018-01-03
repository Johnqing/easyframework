exports.select = function (req, config = {}) {
    let data = [config.id];
    return testOrm.queryClient('select id from test where id = ?', {
    	uniqueid: req.__uniqueid,
        data
    }).then((result)=> {
        return result[0];
    })
};
