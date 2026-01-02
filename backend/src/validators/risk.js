import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Risk } from '../models/risk.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { validate as validateUUID } from 'uuid'

export const validateRisk = [
    check('name')
        .custom(async (value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el nombre del riesgo')
                const existingRisk = await Risk.unscoped().findOne({ where: { name: value }, paranoid: false })
                if (existingRisk) throw new Error('Ya existe un riesgo con este nombre')
            } else if (req.method === 'PATCH') {
                if(value) {
                    const existingRisk = await Risk.unscoped().findOne({ where: { name: value }, paranoid: false })
                    if (existingRisk) {
                        const id  = req.params.id
                        let riskId = validateUUID(id) ? existingRisk.id : existingRisk.slug
                        if ((riskId !== id)) throw new Error('Otro riesgo ya utiliza este nombre')
                    }
                }
            }
            if (value && value.length > 100) throw new Error('El nombre debe tener máximo 100 caracteres')
        return true
    }),
    check('description')
        .custom((value, { req }) => {
            if (req.method === 'POST') { 
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la descripción del riesgo')
            }
            if (value && value.length > 255) throw new Error('La descripción debe tener máximo 255 caracteres') 
            return true
    }),
    check('risk_source')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la fuente del riesgo')
            }
            if (value && value.length > 255) throw new Error('La fuente del riesgo debe tener máximo 255 caracteres') 
            return true
    }),
    check('risk_origin')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el origen del riesgo')
            }
            if (value && !['Interno', 'Externo'].includes(value)) throw new Error('El origen debe ser "Interno" o "Externo"')
            return true
        }),
    check('possible_consequences')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere las posibles consecuencias del riesgo')
            }
            return true
    }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'PATCH'){
                if(value !== undefined && typeof value !== 'boolean') throw new Error('El estado debe ser booleano')
            } 
        return true
    }),
    check('probability')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la probabilidad del riesgo')
            }
            if (value && !['Alta', 'Media', 'Baja'].includes(value)) throw new Error('La probabilidad debe ser Alta, Media o Baja')
            return true
    }),
    check('impact')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el impacto del riesgo')
            }
            if (value && !['Alto', 'Medio', 'Bajo'].includes(value)) throw new Error('El impacto debe ser Alto, Medio o Bajo')
            return true
        }),
    check('ids_process')
        .custom(async (value, { req }) => {
            if (req.method === 'POST') {
                if (!Array.isArray(value) || value.length === 0) throw new Error('Se requiere al menos un proceso asociado')
            }
            if (value) {
                if (!Array.isArray(value) || value.length === 0 || !value.every(id => validateUUID(id))) throw new Error('Todos los IDs de proceso deben ser UUID válidos')
                const processes = await Process.unscoped().findAll({ where: { id: value } })
                if (processes.length !== value.length) throw new Error('Algunos procesos no existen')
                if (processes.some(p => !p.status)) throw new Error('No se pueden asociar procesos inactivos a los riesgos')
            }
            return true
        }),
    check('ids_control')
        .custom(async (value, { req }) => {
            if (value) {
                if (!Array.isArray(value)) throw new Error('El campo ids_control debe ser un arreglo')
                if (value.length > 0) {
                    if (!value.every(id => validateUUID(id))) throw new Error('Todos los IDs de control deben ser UUID válidos')
                    const controls = await Control.unscoped().findAll({ where: { id: value } })
                    if (controls.length !== value.length) throw new Error('Algunos controles no existen')
                    if (controls.some(c => !c.status)) throw new Error('No se pueden asociar controles inactivos a los riesgos')
                }
            }
            return true
        }),
    (req, res, next) => validateResult(req, res, next)
]


