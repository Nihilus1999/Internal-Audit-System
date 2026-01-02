import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { AuditFinding } from '../models/auditFinding.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { AuditFindingControl } from '../models/auditFindingControl.js'
import { AuditTestUser } from '../models/auditTestUser.js'
import { generateAuditSlug } from '../helpers/handleAuditSlug.js'
import { userHasPermission } from '../helpers/handleUserPermission.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import { sequelize }  from '../database/database.js'
import { verifyToken } from '../helpers/handleToken.js'

export const getAuditFindings = async (req, res) => {
    try {
        const data = await AuditFinding.findAll({
            order: [['created_at', 'DESC']]
        })
        const formattedData = data.map(finding => {
            const { slug, title } = finding
            const match = slug.match(/(FY\d{4})$/)
            const fiscalYear = match ? match[1] : ''
            return {
                ...finding.toJSON(),
                title: fiscalYear ? `(${fiscalYear}) ${title}` : title
            }
        })
        return res.json({ data: formattedData })
    } catch(error) {
        serverError(res, error)
    }
}
export const getAuditTestFindings = async (req, res) => {
    try {
        const { id } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTest = await AuditTest.unscoped().findOne({ where: condition })
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const permissionCheck = await userHasPermission(tokenData.id, 'manage.all.tests.audit_program')
        const hasGlobalPermission = permissionCheck.ok
        if (!hasGlobalPermission) {
            const isAssigned = await AuditTestUser.findOne({
                where: { id_audit_test: auditTest.id, id_user: tokenData.id, },
            })
            if (!isAssigned) {
                return res.status(428).json({ message: ['No estas asignado a esta prueba de auditoría y no puedes gestionar sus hallazgos'] })
            }
        }
        const auditFindings = await AuditFinding.unscoped().findAll({ where: { id_audit_test: auditTest.id }, order: [['created_at', 'ASC']]})
        const auditFindingControls = await AuditFindingControl.findAll({
            where: { id_audit_test: auditTest.id },
            include: [ { model: Control.unscoped() },]
        })
        const data = auditFindings.map(finding => {
            const findingControls = auditFindingControls
                .filter(c => c.id_audit_finding === finding.id)
                .map(c => c.control)
            return {
                ...finding.get({ plain: true }),
                controls: findingControls,
            }
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createAuditFinding = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { title, observations, classification, root_cause, possible_consequences, finding_type, recommendations, ids_control } = req.body
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTest = await AuditTest.unscoped().findOne({ where: condition, include: [{ model: AuditProgram }], transaction: t })
        let slug
        try {
            slug = await generateAuditSlug(title, auditTest.audit_program.fiscal_year, 'Finding')
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        const auditFinding = await AuditFinding.create({ slug, title, observations, classification, root_cause, possible_consequences, finding_type, recommendations, id_audit_test: auditTest.id  }, { transaction: t })
        const controls = await Control.findAll({
            where: { id: ids_control, },
            include: [{ model: Process, through: { attributes: [] } }],
            transaction: t,
        })
        const bulkDataControls = controls.flatMap(control =>
            control.processes.map(process => ({
                id_audit_finding: auditFinding.id,
                id_audit_test: auditFinding.id_audit_test,
                id_audit_program: auditTest.audit_program.id,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        await AuditFindingControl.bulkCreate(bulkDataControls, { transaction: t })
        const plain = auditFinding.get({ plain: true })
        const data = {...plain, 
            controls: controls.map(c => {
                const plainControl = c.get({ plain: true })
                delete plainControl.processes
                return plainControl
            })
        }
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getAuditFindingById = async (req, res) => {
    try {
        const { id } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditFinding = await AuditFinding.unscoped().findOne({ where: condition }) 
        const auditFindingControls = await AuditFindingControl.findAll({
            where: { id_audit_finding: auditFinding.id },
            include: [ { model: Control.unscoped() },]
        })
        const controls = auditFindingControls.map(c => c.control)
        const data = { ...auditFinding.get({ plain: true }), controls }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const updateAuditFinding = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { title, observations, classification, root_cause, possible_consequences, finding_type, recommendations, status, ids_control } = req.body
        const { id } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditFindingTestProgram = await AuditFinding.unscoped().findOne({
            where: condition,
            include: {
                model: AuditTest,
                include: {
                    model: AuditProgram
                }
            },
            transaction: t
        })
        let slug
        try {
            if (auditFindingTestProgram.title != title) slug = await generateAuditSlug(title, auditFindingTestProgram.audit_test.audit_program.fiscal_year, 'Finding')
            else slug = auditFindingTestProgram.slug
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        await auditFindingTestProgram.update({ slug, title, observations, classification, root_cause, possible_consequences, finding_type, recommendations, status }, { transaction: t })
        //CONTROLES
        await AuditFindingControl.destroy({ where: { id_audit_finding: auditFindingTestProgram.id }, transaction: t })
        const controls = await Control.findAll({
            where: { id: ids_control, },
            include: [{ model: Process, through: { attributes: [] } }],
            transaction: t,
        })
        const bulkDataControls = controls.flatMap(control =>
            control.processes.map(process => ({
                id_audit_finding: auditFindingTestProgram.id,
                id_audit_test: auditFindingTestProgram.id_audit_test,
                id_audit_program: auditFindingTestProgram.audit_test.audit_program.id,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        await AuditFindingControl.bulkCreate(bulkDataControls, { transaction: t })
        //Retornar la data
        const auditFinding = await AuditFinding.unscoped().findByPk(auditFindingTestProgram.id, { transaction: t })
        const plain = auditFinding.get({ plain: true })
        const data = {...plain, controls: controls.map(c => {
                const plainControl = c.get({ plain: true })
                delete plainControl.processes
                return plainControl
            }) 
        }
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error) 
    }
}

