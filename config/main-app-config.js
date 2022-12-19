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
    password:process.env.REDIS_PASSWORD,
    queuePrependName:process.env.REDIS_QUEUE_PREPEND || 'DEV'
  },
  sendingNotifications:false,
  sendingEmails:false,
  sendgrid: {
    key: process.env.SENDGRID_KEY
  },
  clientUrl: "https://www.gimmie.gifts"
}
