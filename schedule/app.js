const chrono = require('chrono-node');
const moment = require('moment-timezone');
const uuid = require('uuid/v4');
const aws = require('aws-sdk');

let response;
const stepFunctions = new aws.StepFunctions();

exports.lambdaHandler = async (event, context) => {
    try {        
        let body = JSON.parse(event.body);        

        let commandDetails = body.command.trim();        
        let commandWordList = commandDetails.split(' ');

        // Remove the 'schedule' word since right now it's the only command available
        commandWordList.shift();        
        let reminder = commandWordList.join(' ');

        // These next lines are present to correctly parse date given the user's timezone.
        // Followed some recommendations from here: https://github.com/wanasit/chrono/issues/214
        moment.tz.setDefault(body.creator.time_zone);
        let offset = moment().utcOffset();
        const parsedDate = chrono.parse(
            reminder,
            moment().utcOffset(offset)
        )[0].start;
        parsedDate.assign('timezoneOffset', offset);        
        const parsedMoment = moment(parsedDate.date()).utcOffset(offset);                                                
         
        var stepFunctionParams = {
            stateMachineArn: process.env.STATE_MACHINE_ARN,
            input: JSON.stringify({
                // moment.js returns difference as a negative number
                seconds: moment().diff(parsedMoment, "seconds") * -1,
                callback_url: body.callback_url,
                reminder: reminder
            }),
            name: uuid()
        };        
        await stepFunctions.startExecution(stepFunctionParams).promise();            

        response = {
            'statusCode': 200,
            headers: {
                'Content-Type': 'text/html',
            },
            body: `Your event <strong>'${reminder}'</strong> has been scheduled!`                        
        };

        return response;
    } catch (err) {
        console.log(err);
        return err;
    }    
};
