exports.translateDate = function(date1,date2){
    var obj = {};
    var start_date = new Date(date1);
    var end_date = new Date(date2);
    obj.start_date = start_date.Format("yyyy-MM-dd hh:mm:ss");
    obj.end_date = end_date.Format("yyyy-MM-dd hh:mm:ss");
    return obj;
}
exports.translateRiqi = function(date1,date2){
    var obj = {};
    var start_date = new Date(date1);
    var end_date = new Date(date2);
    obj.start_date = start_date.Format("yyyy-MM-dd");
    obj.end_date = end_date.Format("yyyy-MM-dd");
    return obj;
}