const Joi = require('joi');

// Дополняем существующие схемы
const productSchemas = {
  createProduct: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    type: Joi.string().valid('monitors', 'laptops', 'keyboards', 'phones', 'tablets').required() // lowercase
      .messages({
        'any.required': 'Тип продукта обязателен',
        'any.only': 'Недопустимый тип продукта. Разрешены: monitors, laptops, keyboards, phones, tablets'
      }),
    specification: Joi.string().min(10).required(),
    guarantee_start: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    ).optional().allow(null),
    guarantee_end: Joi.alternatives().try(
      Joi.date().iso(), 
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    ).optional().allow(null),
    order_id: Joi.number().integer().positive().required(),
    prices: Joi.array().items(
      Joi.object({
        value: Joi.number().positive().required(),
        symbol: Joi.string().valid('USD', 'UAH', 'EUR').required(),
        isDefault: Joi.boolean().default(false)
      })
    ).optional()
  }).unknown(true),

  updateProduct: Joi.object({
    title: Joi.string().min(2).max(255).optional(),
    type: Joi.string().valid('monitors', 'laptops', 'keyboards', 'phones', 'tablets').optional(),
    specification: Joi.string().min(10).optional(),
    guarantee_start: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    ).optional().allow(null),
    guarantee_end: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    ).optional().allow(null),
    prices: Joi.array().items(
      Joi.object({
        value: Joi.number().positive().required(),
        symbol: Joi.string().valid('USD', 'UAH', 'EUR').required(),
        isDefault: Joi.boolean().default(false)
      })
    ).optional(),
    serialNumber: Joi.string().max(100).optional(),
    isNew: Joi.number().valid(0, 1).optional()
  }),

  productIdParams: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

module.exports = {
  authSchemas: {
    register: Joi.object({
      name: Joi.string().min(2).max(50).required()
        .messages({
          'string.min': 'Имя должно содержать минимум 2 символа',
          'any.required': 'Имя обязательно для заполнения'
        }),
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Некорректный формат email',
          'any.required': 'Email обязателен для заполнения'
        }),
      password: Joi.string().min(6).pattern(/(?=.*[a-zA-Z])(?=.*\d)/).required()
        .messages({
          'string.min': 'Пароль должен содержать минимум 6 символов',
          'string.pattern.base': 'Пароль должен содержать буквы и цифры',
          'any.required': 'Пароль обязателен для заполнения'
        })
    }),

    login: Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Некорректный формат email',
          'any.required': 'Email обязателен для заполнения'
        }),
      password: Joi.string().required()
        .messages({
          'any.required': 'Пароль обязателен для заполнения'
        })
    })
  },

  orderSchemas: {
    createOrder: Joi.object({
      title: Joi.string().min(2).max(100).required()
        .messages({
          'any.required': 'Название прихода обязательно'
        }),
      description: Joi.string().max(500).required()
        .messages({
          'any.required': 'Описание обязательно'
        }),
      date: Joi.date().required()
        .messages({
          'any.required': 'Дата обязательна'
        })
    }),

    orderIdParams: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  },

  productSchemas
};