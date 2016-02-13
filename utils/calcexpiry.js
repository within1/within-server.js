
// calculates the expiry date, and number of hours from current date until then
function calcExpiryHourTime(matchExpiration, hrsPastMidnight) {
	var expDate = new Date();
	expDate.setHours(expDate.getHours() + matchExpiration);
	var notifDate = new Date(expDate);
	if (notifDate.getHours() > hrsPastMidnight)
		notifDate.setDate(notifDate.getDate() + 1);
	notifDate.setHours( hrsPastMidnight );
	notifDate.setMinutes(0);
	var hrsLeft = Math.floor( (notifDate - new Date() ) / (60*60*1000) );
	return [expDate, hrsLeft];
}


console.log(calcExpiryHourTime(6*24, 14))