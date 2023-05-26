let nextErrNum = 0;

function Error(msg) {
    this.num = nextErrNum;
    nextErrNum++;
    this.msg = msg;

    this.toString = () => (`Error number: ${this.num}\nDescription: ${this.msg}`);
}

exports.Error = Error;

exports.errors = {
    LoginFailed: new Error('Login failed. Incorrect username and/or password'),
    AdminNotFoundById: new Error('Admin not found with the given id'),
    SurveyNotFoundById: new Error('Survey not found with the given id'),
    SurveyReplyNotFoundById: new Error('Survey reply not found with the given id')
};