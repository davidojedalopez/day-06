const axios = require('axios');

let response;

exports.lambdaHandler = async (event, context) => {
    try { 

        // Event body is the same as first state of state machine; the waiting one.
        await axios.post(event.callback_url, {content: `Your event <strong>'${event.reminder}'</strong> is happening <strong>now</strong>`})        
        
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: `Scheduled event!`                
            })
        }

        return response
    } catch (err) {
        console.log(err);
        return err;
    }    
};
