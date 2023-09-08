const express = require('express');

const router = express.Router();

const ctrl = require("../../controllers/contacts")

const { validateBody, isValidId, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/contact");

router.get('/', authenticate, ctrl.listContacts);

router.get("/:id", authenticate, isValidId, ctrl.getById);

router.post('/', authenticate, validateBody(schemas.contactsSchema), ctrl.add);

router.put('/:id', authenticate, validateBody(schemas.contactsSchema), ctrl.updateById);

router.delete('/:id', authenticate, isValidId, ctrl.removeById);

router.patch("/:id/favorite", authenticate, isValidId, validateBody(schemas.updateFavoriteSchema), ctrl.updateStatusContact);

module.exports = router;
