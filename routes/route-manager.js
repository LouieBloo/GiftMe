const { check, validationResult } = require('express-validator');
const { matchedData, sanitize } = require('express-validator');

module.exports = function (route) {
  return [
    route.validation,
    async (req, res, next) => {

      let parameterError = await paramValidator(req).catch(async (error) => {
        return res.status(422).json(error);
      });

      if(parameterError){
        return;
      }

      await route.handler(req, res, next).then(async (response) => {
        return res.status(response.status ? response.status : 200).json(response.response);
      }).catch(async (error) => {
        console.log(error)
        return res.status(error.status ? error.status : 503).json(error.error);
      })
    },
  ]
}

const paramValidator = async (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ({ error: errors.mapped() });
  }
  req.validParams = matchedData(req);
}