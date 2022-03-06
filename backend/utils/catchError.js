module.exports = (res, message, status, error = null) => {
    if (!error) console.log(error);
    res.status(status).send(message);
}