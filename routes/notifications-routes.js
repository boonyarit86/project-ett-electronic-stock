const express = require('express');

const notificationsController = require('../controllers/notifications-controllers');


const router = express.Router();

router.get('/:uid', notificationsController.getAllNotifications);
router.post('/', notificationsController.createNotification);
router.patch('/:uid', notificationsController.clearNotification)




module.exports = router;