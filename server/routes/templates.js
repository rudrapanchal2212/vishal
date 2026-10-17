const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  instantiateTemplate
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.post('/:id/instantiate', instantiateTemplate);

module.exports = router;
