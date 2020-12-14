const sgMail = require('@sendgrid/mail'); 
const config = require('../../config/main-app-config')
sgMail.setApiKey(config.sendgrid.key);

const templateIds = {
  listUpdate:"d-82a008552606427bbc85fc8bfefdd982",
}
const from = "admin@gimmie.gifts"

module.exports.templateIds = templateIds;

module.exports.sendEmail = async (to, subject, templateId, dynamicTemplateData = null) => {

  if(!config.sendingEmails){return;}

  //to is an array of strings
  if(!to){
    return
  }
  const toArray = Array.isArray(to) ? to : [to];
  const personalizations = [];

  toArray.map(emailAddress => {
    personalizations.push({to: [{email:emailAddress}]})
  })

  const msg = {
    personalizations: personalizations,
    from: from,
    subject: subject || "nothing",
    template_id: templateId,
    dynamic_template_data: dynamicTemplateData,
  };
  return await sgMail.send(msg)
}