import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { User } from '../models/user.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { File } from '../models/file.js'
import { AuditFindingControl } from '../models/auditFindingControl.js'
import { AuditTestControl } from '../models/auditTestControl.js'
import { AuditTestUser } from '../models/auditTestUser.js'
import { generateAuditSlug } from '../helpers/handleAuditSlug.js'
import { userHasPermission } from '../helpers/handleUserPermission.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import { sequelize }  from '../database/database.js'
import { verifyToken } from '../helpers/handleToken.js'
import { Op } from 'sequelize'
import mime from 'mime-types'

export const getPlanningAuditTests = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditTests = await AuditTest.unscoped().findAll({ where: { id_audit_program: auditProgram.id }, })
        const auditTestParticipants = await AuditTestUser.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: User.unscoped() },
            ],
            order: [['created_at', 'ASC']]
        })
        const auditTestControls = await AuditTestControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: Control.unscoped() },
            ]
        })
        const data = auditTests.map(test => {
            const testUsers = auditTestParticipants
                .filter(p => p.id_audit_test === test.id)
                .map(p => p.user)
            const testControls = auditTestControls
                .filter(c => c.id_audit_test === test.id)
                .map(c => c.control)
            return {
                ...test.get({ plain: true }),
                users: testUsers,
                controls: testControls,
            }
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}
export const createTest = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { title, objective, scope, procedure, evaluation_criteria, estimated_hours, start_date, ids_control, ids_user } = req.body
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        let slug
        try {
            slug = await generateAuditSlug(title, auditProgram.fiscal_year, 'Test')
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        const auditTest = await AuditTest.create({ slug, title, objective, scope, procedure, evaluation_criteria, estimated_hours, start_date, id_audit_program: auditProgram.id  }, { transaction: t })
        const controls = await Control.findAll({
            where: { id: ids_control, },
            include: [{ model: Process, through: { attributes: [] } }],
            transaction: t,
        })
        const users = await User.findAll({ where: { id: ids_user, }, transaction: t, })
        const bulkDataControls = controls.flatMap(control =>
            control.processes.map(process => ({
                id_audit_test: auditTest.id,
                id_audit_program: auditProgram.id,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        const bulkDataUsers = users.map(user => ({
            id_audit_test: auditTest.id,
            id_audit_program: auditProgram.id,
            id_user: user.id,
        }))
        await AuditTestControl.bulkCreate(bulkDataControls, { transaction: t })
        await AuditTestUser.bulkCreate(bulkDataUsers, { transaction: t })
        const plain = auditTest.get({ plain: true })
        const data = {...plain, users: users.map(u => u.get({ plain: true })),
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
export const getPlanningAuditTestById = async (req, res) => {
    try {
        const { id } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTest = await AuditTest.unscoped().findOne({ where: condition }) 
        const [auditTestParticipants, auditTestControls] = await Promise.all([
            AuditTestUser.findAll({
                where: { id_audit_test: auditTest.id },
                include: [{ model: User.unscoped() }],
            }),
            AuditTestControl.findAll({
                where: { id_audit_test: auditTest.id },
                include: [{ model: Control.unscoped() }],
            }),
        ])
        const users = auditTestParticipants.map(p => p.user)
        const controls = auditTestControls.map(c => c.control)
        const data = { ...auditTest.get({ plain: true }), users, controls, }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}
export const updatePlanningTestById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { title, objective, scope, procedure, evaluation_criteria, estimated_hours, start_date, status, ids_control, ids_user } = req.body
        const { id } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTestProgram = await AuditTest.unscoped().findOne({
            where: condition,
            include: { model: AuditProgram },
            transaction: t
        }) 
        let slug
        try {
            if(auditTestProgram.title != title) slug = await generateAuditSlug(title, auditTestProgram.audit_program.fiscal_year, 'Test')
            else slug = auditTestProgram.slug
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        await auditTestProgram.update({ slug, title, objective, scope, procedure, evaluation_criteria, estimated_hours, start_date, status }, { transaction: t })
        //CONTROLES
        const existingRecords = await AuditTestControl.findAll({
            where: { id_audit_test: auditTestProgram.id },
                transaction: t
        })
        const existingControlIds = existingRecords.map(r => r.id_control)
        const toAdd = ids_control.filter(id => !existingControlIds.includes(id))
        const toRemove = existingControlIds.filter(id => !ids_control.includes(id))
        if (toRemove.length > 0) {
            const findingUsage = await AuditFindingControl.findAll({
                where: { id_audit_test: auditTestProgram.id, id_control: toRemove },
                transaction: t
            })
            if (findingUsage.length > 0) {
                await t.rollback()
                return res.status(422).json({message: [`No puedes eliminar controles ya utilizados en hallazgos`]})
            }
            await AuditTestControl.destroy({
                where: { id_audit_test: auditTestProgram.id, id_control: toRemove },
                transaction: t
            })
        }
        const newControls = await Control.findAll({
            where: { id: toAdd },
            include: [{ model: Process, through: { attributes: [] } }],
            transaction: t
        })
        const bulkDataControls = newControls.flatMap(control =>
            control.processes.map(process => ({
                id_audit_test: auditTestProgram.id,
                id_audit_program: auditTestProgram.id_audit_program,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        if (bulkDataControls.length > 0) await AuditTestControl.bulkCreate(bulkDataControls, { transaction: t })
        const controls = await Control.findAll({
            where: { id: ids_control },
            transaction: t
        })
        //USUARIOS
        await AuditTestUser.destroy({ where: { id_audit_test: auditTestProgram.id }, transaction: t })
        const users = await User.findAll({ where: { id: ids_user, }, transaction: t, })
        const bulkDataUsers = users.map(user => ({
            id_audit_test: auditTestProgram.id,
            id_audit_program: auditTestProgram.id_audit_program,
            id_user: user.id,
        }))
        await AuditTestUser.bulkCreate(bulkDataUsers, { transaction: t })
        //Retornar la data
        const auditTest = await AuditTest.unscoped().findByPk(auditTestProgram.id, { transaction: t })
        const plain = auditTest.get({ plain: true })
        const data = {...plain, users: users.map(u => u.get({ plain: true })), controls: controls.map(c => c.get({ plain: true })) }
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error) 
    }
}
export const getTestFiles = (fileType) => async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTest = await AuditTest.unscoped().findOne({ where: condition })
        const data = await File.findAll({
            where: { id_audit_test: auditTest.id, test_file_type: fileType },
            attributes: ['id', 'file_name', 'extension', 'created_at'],
            order: [['created_at', 'ASC']],
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}
export const uploadTestFiles = (fileType) => async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditTest = await AuditTest.unscoped().findOne({ where: condition, transaction: t })
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) return res.status(400).json({ error: 'No se han enviado archivos' })
        for (const file of req.files) {
            const extension = file.originalname.split('.').pop()
            if (extension.length > 5) {
                await t.rollback()
                return res.status(415).json({ error: `La extensión '${extension}' del archivo '${file.originalname}' es demasiado larga (máximo 5 caracteres)` })
            }
        }
        const filesToCreate = req.files.map(file => ({ file_name: file.originalname, extension: file.originalname.split('.').pop(), content: file.buffer, test_file_type: fileType, id_audit_test: auditTest.id }))
        const files = await File.bulkCreate(filesToCreate, { transaction: t })    
        const data = files.map(f => ({ id: f.id, file_name: f.file_name, extension: f.extension, id_audit_test: f.id_audit_test, test_file_type: f.test_file_type, created_at: f.created_at, }))
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const downloadTestFile = async (req, res) => {
    try {
        const id = req.params.id
        const file = await File.findByPk(id)
        const mimeType = mime.lookup(file.extension) || 'application/octet-stream'
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`)
        return res.send(file.content)
    } catch (error) {
        serverError(res, error)
    }
}
export const deleteTestFile = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const file = await File.findByPk(id, { transaction: t })
        await file.destroy({ transaction: t })
        await t.commit()
        return res.json({ message: ['Documento eliminado correctamente'] })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getExecutionAuditTests = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const permissionCheck = await userHasPermission(tokenData.id, 'manage.all.tests.audit_program')
        const hasGlobalPermission = permissionCheck.ok
        let auditTests = await AuditTest.unscoped().findAll({ 
            where: { id_audit_program: auditProgram.id, status: { [Op.ne]: 'Suspendido' } },
            order: [['created_at', 'ASC']]
        })
        const auditTestParticipants = await AuditTestUser.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: User.unscoped() },
            ]
        })
        const auditTestControls = await AuditTestControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: Control.unscoped() },
            ]
        })
        if (!hasGlobalPermission) {
            const userTestIds = auditTestParticipants
                .filter(p => p.id_user === tokenData.id)
                .map(p => p.id_audit_test)
            auditTests = auditTests.filter(test => userTestIds.includes(test.id))
        }
        const data = auditTests.map(test => {
            const testUsers = auditTestParticipants
                .filter(p => p.id_audit_test === test.id)
                .map(p => p.user)
            const testControls = auditTestControls
                .filter(c => c.id_audit_test === test.id)
                .map(c => c.control)
            return {
                ...test.get({ plain: true }),
                users: testUsers,
                controls: testControls,
            }
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const getExecutionAuditTestById = async (req, res) => {
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
                where: {
                    id_audit_test: auditTest.id,
                    id_user: tokenData.id,
                },
            })
            if (!isAssigned) {
                return res.status(428).json({ message: ['No estas asignado a esta prueba de auditoría'] })
            }
        }
        const [auditTestParticipants, auditTestControls] = await Promise.all([
            AuditTestUser.findAll({
                where: { id_audit_test: auditTest.id },
                include: [{ model: User.unscoped() }],
            }),
            AuditTestControl.findAll({
                where: { id_audit_test: auditTest.id },
                include: [{ model: Control.unscoped() }],
            }),
        ])
        const users = auditTestParticipants.map(p => p.user)
        const controls = auditTestControls.map(c => c.control)
        const data = { ...auditTest.get({ plain: true }), users, controls, }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const updateConclusionsAuditTestById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { conclusion, recommendations, status } = req.body
        const data = await AuditTest.unscoped().findOne({ where: condition, transaction: t })
        await data.update({ conclusion, recommendations, status }, { transaction: t })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}