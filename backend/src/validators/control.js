import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Control } from '../models/control.js'
import { Process } from '../models/process.js'
import { Risk } from '../models/risk.js'
import { validate as validateUUID } from 'uuid'

export const validateControl = [
    check('name')
        .custom(async (value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el nombre del control')
                const existingControl = await Control.unscoped().findOne({ where: { name: value }, paranoid: false })
                if (existingControl) throw new Error('Ya existe un control con este nombre')
            } else if (req.method === 'PATCH') {
                if(value) {
                    const existingControl = await Control.unscoped().findOne({ where: { name: value }, paranoid: false })
                    if (existingControl) {
                        const id  = req.params.id
                        let controlId = validateUUID(id) ? existingControl.id : existingControl.slug
                        if ((controlId !== id)) throw new Error('Otro control ya utiliza este nombre')
                    }
                }
            }
            if (value && value.length > 100) throw new Error('El nombre debe tener máximo 100 caracteres')
        return true
    }),
    check('description')
        .custom((value, { req }) => {
            if (req.method === 'POST') { 
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la descripción del control')
            }
            if (value && value.length > 255) throw new Error('La descripción debe tener máximo 255 caracteres') 
            return true
    }),
    check('control_type')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el tipo de control')
            }
            if (value && !['Preventivo', 'Detectivo', 'Correctivo'].includes(value)) throw new Error('El tipo de control debe ser Preventivo, Detectivo o Correctivo') 
            return true
    }),
    check('management_type')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el tipo de gestión del control')
            }
            if (value && !['Automático', 'Manual', 'Combinado'].includes(value)) throw new Error('El tipo de gestión debe ser Automático, Manual o Combinado')
            return true
        }),
    check('teoric_effectiveness')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la efectividad teórica del control')
            }
            if (value && !['Óptimo', 'Aceptable', 'Deficiente'].includes(value)) throw new Error('La efectividad teórica debe ser Óptimo, Aceptable o Deficiente')
            return true
    }),
    check('application_frequency')
        .custom((value, { req }) => {
            if (req.method === 'POST') {
                if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere la frecuencia de aplicación del control')
            }
            if (value && !['Cuando sea requerido', 'Anual', 'Mensual', 'Quincenal', 'Semanal', 'Diario', 'Por Hora', 'Tiempo Real'].includes(value)) throw new Error('La frecuencia de aplicación debe ser Cuando sea requerido, Anual, Mensual, Quincenal, Semanal, Diario, Por Hora o Tiempo Real')
            return true
    }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'PATCH'){
                if(value !== undefined && typeof value !== 'boolean') throw new Error('El estado debe ser booleano')
            } 
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
                if (processes.some(p => !p.status)) throw new Error('No se pueden asociar procesos inactivos a los controles')
            }
            return true
        }),
    check('ids_risk')
        .custom(async (value, { req }) => {
            if (req.method === 'POST') {
                if (!Array.isArray(value) || value.length === 0) throw new Error('Se requiere al menos un riesgo asociado')
            }
            if (value) {
                if (!Array.isArray(value) || value.length === 0 || !value.every(id => validateUUID(id))) throw new Error('Todos los IDs de riesgo deben ser UUID válidos')
                const risks = await Risk.unscoped().findAll({ where: { id: value } })
                if (risks.length !== value.length) throw new Error('Algunos riesgos no existen')
                if (risks.some(p => !p.status)) throw new Error('No se pueden asociar riesgos inactivos a los controles')
            }
            return true
        }),
    (req, res, next) => validateResult(req, res, next)
]


