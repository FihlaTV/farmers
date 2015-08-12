/**
 * Created by eriy on 29.04.2015.
 */
var dateControl = function(){

    function WeekEndValidate(timeZone, date) {
        var thisDate;

        if (date){
            thisDate = new Date(date)
        } else {
            thisDate = new Date();
        }

        thisDate.setHours(thisDate.getHours() + timeZone);

        return (thisDate.getDay() === 0 || thisDate.getDay() === 6 ) ? true : false;
    }

    return {
        isWeekEnd : WeekEndValidate
    }
};

module.exports = dateControl;
