module.exports = {
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  redis:{
    host: process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
  },
  sendingNotifications:true,
  sendingEmails:true,
  sendgrid: {
    key: process.env.SENDGRID_KEY
  }
}