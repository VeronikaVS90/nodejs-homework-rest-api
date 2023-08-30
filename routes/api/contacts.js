const express = require('express');

const router = express.Router();

const ctrl = require("../../controllers/contacts")

const { validateBody, isValidId } = require("../../middlewares");

const { schemas } = require("../../models/contact");

router.get('/', ctrl.listContacts);

router.get("/:id", isValidId, ctrl.getById);

router.post('/', validateBody(schemas.contactsSchema), ctrl.add);

router.put('/:id', validateBody(schemas.contactsSchema), ctrl.updateById);

router.delete('/:id', isValidId, ctrl.removeById);

router.patch("/:id/favorite", isValidId, validateBody(schemas.updateFavoriteSchema), ctrl.updateStatusContact);

module.exports = router;
