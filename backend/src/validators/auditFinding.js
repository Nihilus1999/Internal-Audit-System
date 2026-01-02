import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Control } from '../models/control.js'
import { AuditTest } from '../models/auditTest.js'
import { AuditFinding } from '../models/auditFinding.js'
import { AuditTestControl } from '../models/auditTestControl.js'
import { validate as validateUUID } from 'uuid'

export const validateAuditFinding = [
    check('title')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el título del hallazgo')
        .isLength({ max: 100 })
        .withMessage('El título del hallazgo de auditoría debe tener máximo 100 caracteres'),
    check('observations')
        .exists()
        .notEmpty()
        .withMessage('Se requieren las observaciones del hallazgo'),
    check('classification')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la clasificación del hallazgo')
        .isIn(['Menor', 'Moderado', 'Importante', 'Crítico'])
        .withMessage('La clasificación del hallazgo debe ser: Menor, Moderado, Importante o Crítico'),
    check('root_cause')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la causa raíz del hallazgo')
        .isLength({ max: 255 })
        .withMessage('La causa raíz del hallazgo debe tener máximo 255 caracteres'),
    check('possible_consequences')
        .exists()
        .notEmpty()
        .withMessage('Se requieren las posibles consecuencias del hallazgo'),
    check('finding_type')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el tipo de hallazgo')
        .isIn(['Conforme', 'No conforme'])
        .withMessage('El tipo de hallazgo debe ser: Conforme o No conforme'),
    check('recommendations')
        .exists()
        .notEmpty()
        .withMessage('Se requieren las recomendaciones del hallazgo'),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del hallazgo')
            if (typeof value !== 'boolean') throw new Error('El estado debe ser un valor booleano: true o false')
            return true
        }),
    check('ids_control')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El hallazgo debe tener controles asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de control inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los controles deben ser del tipo: UUID')
            const id = req.params.id
            let condition = validateUUID(id) ? { id } : { slug: id }
            if (req.method === 'PUT') {
                const auditFinding = await AuditFinding.unscoped().findOne({ where: condition })
                condition = { id: auditFinding.id_audit_test }
            }
            const auditTest = await AuditTest.unscoped().findOne({ where: condition })
            const validControls = await AuditTestControl.findAll({
                where: {
                    id_audit_test: auditTest.id,
                    id_control: value
                },
                attributes: ['id_control'],
            })
            const validControlIds = validControls.map(c => c.id_control)
            const controls = await Control.unscoped().findAll({ where: { id: validControlIds } })
            if (controls.length !== value.length) throw new Error('Algunos controles no estan asignados a la prueba de auditoría o no existen')
            if (controls.some(c => !c.status)) throw new Error('No se pueden asignar controles inactivos a los hallazgos')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]