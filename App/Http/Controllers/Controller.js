// Node Modules
const Recaptcha = require('express-recaptcha').Recaptcha;
const { validationResult } = require('express-validator/check');
const isMongoId = require('validator/lib/isMongoId');

class Controller
{
    constructor()
    {
        Bind(this);
        this.RecaptchaConfiguration();
    }

    RecaptchaConfiguration()
    {
        this.Recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);
    }

    ValidateRecaptcha(Request, Response)
    {
        return new Promise((resolve) =>
        {
            this.Recaptcha.verify(Request, (Error) =>
            {
                if (Error)
                {
                    Request.flash('Errors', 'Incorrect Captcha. Try again.');
                    Request.flash('GetFormData', Request.body);
                    return Response.redirect('back');
                }

                resolve(true);
            });
        });
    }

    async ValidateData(Request)
    {
        const Result = validationResult(Request);

        if (!Result.isEmpty())
        {
            const Errors = Result.array();
            const Messages = [];

            Errors.forEach(Error => Messages.push(Error.msg));

            Request.flash('Errors', Messages);

            return false;
        }

        return true;
    }

    Slug(Slug)
    {
        return Slug.replace(/([^a-zA-Z0-9]|-)+/g, '-');
    }

    ValidateMongoID(ID)
    {
        if (!isMongoId(ID))
            this.SetError('Invalid MongoID', 404);
    }

    SetError(Message, Status)
    {
        let _Error = new Error(Message);
        _Error.statusCode = Status;
        throw _Error;
    }
}

module.exports = Controller;
