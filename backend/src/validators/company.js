import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Company } from '../models/company.js'

const allowedSectors = [
    'Banca',
    'Energía',
    'Construcción/Infraestructura',
    'Salud',
    'Financiero',
    'Educación',
    'Comercio',
    'Seguros',
    'Alimentos',
    'Transporte',
    'TI / Telecomunicaciones',
    'Otro'
]

const allowedMonths = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
]

export const validateCompany = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre de la empresa')
        .isLength({ max: 120 })
        .withMessage('El nombre de la empresa debe tener máximo 120 caracteres')
        .custom(async (value, { req }) => {      
            const existingCompany = await Company.unscoped().findOne({ where: { name: value }, paranoid: false })
            if (existingCompany && existingCompany.rif !== 'J-401375855') throw new Error('Otra empresa ya utiliza ese nombre')
            return true
        }),
    check('description')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la descripción de la empresa')
        .isLength({ max: 255 })
        .withMessage('La descripción debe tener máximo 255 caracteres'),
    check('phone') 
        .exists()
        .isMobilePhone()
        .withMessage('Número de teléfono invalido'),
    check('email')
        .exists()
        .isEmail()
        .withMessage('Correo electrónico inválido')
        .isLength({ max: 255 })
        .withMessage('El correo electrónico debe tener máximo 255 caracteres'),
    check('sector')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el sector de la empresa')
        .isIn(allowedSectors)
        .withMessage(`El sector debe ser uno de los siguientes: ${allowedSectors.join(', ')}`),
    check('fiscal_year_month')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el año fiscal de la empresa')        
        .isIn(allowedMonths)
        .withMessage(`El mes del año fiscal debe ser uno de los siguientes: ${allowedMonths.join(', ')}`),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


