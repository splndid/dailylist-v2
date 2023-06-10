module.exports.getDate = getDate;

function getDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return now.toLocaleString('en-US', options);    
}