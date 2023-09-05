const Contact = require("../models/contact");

const { HttpError, ctrlWrapper } = require("../helpers");

const listContacts = async (req, res) => {
  const { _id: owner } = req.user;

  const { page = 1, limit = 20, favorite = null } = req.query;
  const skip = (page - 1) * limit;

  const query = { owner };

  if (favorite !== null) {
    query.favorite = favorite;
    console.log(query);
  }

  const result = await Contact.find(query, "-createdAt -updatedAt", {
    skip,
    limit
  }).populate("owner", "email subscription");
  res.json(result);
};

const getById = async (req, res) => {
        const { id } = req.params;
        const result = await Contact.findById(id);

        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};

const add = async (req, res) => {
        const { _id: owner } = req.user;
        const result = await Contact.create({ ...req.body, owner });
        res.status(201).json(result);
};

const updateById = async (req, res) => {    
        const { id } = req.params;
        const result = await Contact.findByIdAndUpdate(id, req.body, {
                new: true,
        });

        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};

const removeById = async (req, res) => {
        const { id } = req.params;
        const result = await Contact.findByIdAndRemove(id);

        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json({
            message: "Remove successfully"
        })
};

const updateStatusContact = async (req, res) => {
  const { id } = req.params;

  const result = await Contact.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

module.exports = {
    listContacts: ctrlWrapper(listContacts),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    removeById: ctrlWrapper(removeById),
    updateStatusContact: ctrlWrapper(updateStatusContact),
}