module.exports = (res, message, status, error = null) => {
    if (!error) console.error(error);
    res.status(status).send(message);
}