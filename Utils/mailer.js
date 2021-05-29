const sgMail = require('@sendgrid/mail');
const path = require('path')

require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const activationEmailBody = ({to, name, token}) => {
    let link = `${process.env.DOMAIN}/user/activate/${token}`
    let msg = {
        to,
        from: {
            email: process.env.FROM_EMAIL, 
            name: 'The Restaurant'
        },
        subject: 'The Restaurant - User Activation Email',
        text: `Hi ${name}! Thank you for signing up to our Restaurant's website. You can activate your account by clicking the link below. This link will be valid only for 24 hours
               ${link}
               Happy Ordering!
               Cheers,
               The Restaurant Team`,
        html: `<!DOCTYPE html>
               <html> Hi ${name}! <br><br>
               Thank you for signing up to our Restaurant's website. You can activate your account by clicking the link below. This link will be valid only for 24 hours <br>
               <a href="${link}" target="_blank">${link}</a><br><br>
               Happy Ordering!<br><br>
               Cheers,<br>
               The Restaurant Team
               </html>`
      };
    return msg
}


const passwordResetEmailBody = ({to, name, token}) => {
    let link = `${process.env.DOMAIN}/user/reset_password/${token}`
    let msg = {
        to,
        from: {
            email: process.env.FROM_EMAIL, 
            name: 'The Restaurant'
        },
        subject: 'The Restaurant - Password reset',
        text: `Hi ${name}! To reset your password, click on the link below. This link will be valid only for 24 hours.
               ${link}
               Cheers,
               The Restaurant Team`,
        html: `<!DOCTYPE html>
               <html> Hi ${name}! <br><br>
               To reset your password, click on the link below. This link will be valid only for 24 hours.<br>
               <a href="${link}" target="_blank">${link}</a><br><br>
               Cheers,<br>
               The Restaurant Team
               </html>`
      };
    return msg
}

const sendMail = async (msg) => {
    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
    }
}

module.exports = {
    activationEmailBody,
    passwordResetEmailBody,
    sendMail
}