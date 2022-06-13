export const findDocuments = async (model, query = {}, select) => {
  return model.find(query).sort({ updatedAt: -1, order: 1 }).select(select)
}

export const findDocument = async (model, query = {}, select) => {
  return model.findOne(query).select(select)
}

export const createDocument = async (model, input, select) => {
  const { id: _id } = await model.create(input)
  return findDocument(model, { _id }, select)
}

export const updateDocument = async (model, _id, input, select) => {
  await model.updateOne({ _id }, input, { returnOriginal: false })
  return findDocument(model, { _id }, select)
}
