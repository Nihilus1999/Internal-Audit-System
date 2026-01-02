import { AuditProgram } from '../models/auditProgram.js'
import { Company } from '../models/company.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { Risk } from '../models/risk.js'
import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { AuditFinding } from '../models/auditFinding.js'
import { AuditProcessControl } from '../models/auditProcessControl.js'
import { AuditUser } from '../models/auditUser.js'
import { AuditTestControl } from '../models/auditTestControl.js'
import { AuditTestUser } from '../models/auditTestUser.js'
import { AuditFindingControl } from '../models/auditFindingControl.js'
import { serverError } from '../helpers/handleServerError.js'
import { getFiscalYear } from '../helpers/handleFiscalYear.js'
import { generateAuditSlug } from '../helpers/handleAuditSlug.js'
import { userHasPermission } from '../helpers/handleUserPermission.js'
import { validate as validateUUID } from 'uuid'
import { verifyToken } from '../helpers/handleToken.js'
import { sequelize }  from '../database/database.js'
import { Op } from 'sequelize'

export const getAuditPrograms = async (req, res) => {
    try {
        const { fiscal_year, process, skip = 0, limit = 3 } = req.query
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const permissionCheck = await userHasPermission(tokenData.id, 'get.all.audit_program')
        const hasGlobalPermission = permissionCheck.ok
        let auditProgramIds = null
        if (process) {
            const apcs = await AuditProcessControl.findAll({
                where: { id_process: process },
                attributes: ['id_audit_program'],
                group: ['id_audit_program'],
            })
            auditProgramIds = apcs.map(apc => apc.id_audit_program)
            if (auditProgramIds.length === 0) {
                return res.json({ data: [], count: 0, skip: parseInt(skip), limit: parseInt(limit) })
            }
        }
        const where = {}
        if (fiscal_year) where.fiscal_year = fiscal_year
        if (!hasGlobalPermission) {
            const assignments = await AuditUser.findAll({
                where: { id_user: tokenData.id },
                attributes: ['id_audit_program'],
                group: ['id_audit_program'],
            })
            let userAuditProgramIds = assignments.map(a => a.id_audit_program)
            if (userAuditProgramIds.length === 0) {
                return res.json({ data: [], count: 0, skip: parseInt(skip), limit: parseInt(limit) })
            }
            if (auditProgramIds) {
                userAuditProgramIds = userAuditProgramIds.filter(id => auditProgramIds.includes(id))
                if (userAuditProgramIds.length === 0) {
                    return res.json({ data: [], count: 0, skip: parseInt(skip), limit: parseInt(limit) })
                }
            }
            where.id = userAuditProgramIds
            where.status = { [Op.ne]: 'Suspendido' }
        } else {
            if (auditProgramIds) where.id = auditProgramIds
        }
        const { rows: auditPrograms, count } = await AuditProgram.unscoped().findAndCountAll({
            where,
            include: [ { model: User.unscoped(), through: { attributes: [] } } ],
            offset: parseInt(skip),
            limit: parseInt(limit),
            distinct: true,
            order: [['fiscal_year', 'DESC']],
        })
        const auditProgramIdsFetched = auditPrograms.map(ap => ap.id)
        if (auditProgramIdsFetched.length === 0) {
            return res.json({ data: [], count: 0, skip: parseInt(skip), limit: parseInt(limit) })
        }
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgramIdsFetched },
            include: [{ model: Process.unscoped() }],
        })
        const data = auditPrograms.map(ap => {
            const plain = ap.get({ plain: true })
            const processes = auditProcessControls
                .filter(apc => apc.id_audit_program === ap.id && apc.process)
                .map(apc => apc.process.get({ plain: true }))
            const uniqueProcesses = Array.from(
                new Map(processes.map(p => [p.id, p])).values()
            )
            return { ...plain, processes: uniqueProcesses }
        })
        return res.json({ data, count, skip: parseInt(skip), limit: parseInt(limit) })
    } catch (error) {
        serverError(res, error)
    }
}

export const getAuditFiscalYears = async (req, res) => {
    try {
        const auditPrograms = await AuditProgram.unscoped().findAll({
            attributes: ['fiscal_year'],
            raw: true,
        })
        const yearsSet = new Set()
        auditPrograms.forEach(program => {
            yearsSet.add(String(program.fiscal_year))
        })
        const uniqueYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
        return res.json({ data: uniqueYears })
    } catch (error) {
        serverError(res, error)
    }
}

export const getAuditProgramById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({
            where: condition,
            include: [ 
                { model: User.unscoped(), 
                    through: { attributes: ['planning_requirements_hours', 'test_execution_hours', 'document_evidence_hours', 'document_findings_hours', 'report_preparation_hours', 'report_revision_hours'] },
                    include: [ { model: Role.unscoped(), attributes: ['name'], } ],
                    required: false
                } 
            ],
        })
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const permissionCheck = await userHasPermission(tokenData.id, 'get.all.audit_program')
        const hasGlobalPermission = permissionCheck.ok
            if (!hasGlobalPermission) {
            const assignedUserIds = auditProgram.users.map(u => u.id)
            if (!assignedUserIds.includes(tokenData.id)) {
                return res.status(403).json({ message: ['No tienes permiso para acceder a este programa de auditoría'] })
            }
        }
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: Process.unscoped() },
                { model: Control.unscoped() },
            ],
            order: [[{ model: Process }, 'slug', 'ASC']],
            order: [[{ model: Control }, 'slug', 'ASC']],
        })
        const auditFinding = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: AuditFinding },
            ],
        })
        const processes = [...new Map(auditProcessControls.filter(apc => apc.process).map(apc => [apc.process.id, apc.process.get({ plain: true })])).values()]
        const controls = [...new Map(auditProcessControls.filter(apc => apc.control).map(apc => [apc.control.id, apc.control.get({ plain: true })])).values()]
        const audit_findings = [...new Map(auditFinding.filter(p => p.audit_finding).map(p => [p.audit_finding.id, p.audit_finding.get({ plain: true })])).values()]
        const plain = auditProgram.get({ plain: true })
        const data = {...plain, processes, controls, audit_findings}
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}
export const createAuditProgram = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, objectives, scope, evaluation_criteria, audited_period_start_date, audited_period_end_date, start_date, end_date, ids_process, ids_user } = req.body
        const company = await Company.findOne({ where: { rif : 'J-401375855' }, transaction: t })
        if (!company) {
            await t.rollback()
            return res.status(404).json({ message: ['Compañía no encontrada'] })
        }
        let fiscal_year, slug
        try {
            fiscal_year = getFiscalYear( company.fiscal_year_month, audited_period_start_date, audited_period_end_date )
            slug = await generateAuditSlug(name, fiscal_year, 'Program')
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        const auditProgram = await AuditProgram.create({ slug, name, objectives, scope, evaluation_criteria, fiscal_year, audited_period_start_date, audited_period_end_date, start_date, end_date }, { transaction: t })
        await auditProgram.setUsers(ids_user, { transaction: t })
        const processes = await Process.findAll({
            where: { id: ids_process, },
            include: [{
                model: Control,
                through: { attributes: [] },
                where: { status: true },
                required: true, // Solo procesos que tienen controles activos
            }],
            transaction: t,
        })
        if (processes.length != ids_process.length) {
            await t.rollback()
            return res.status(403).json({ message: ['Algunos procesos seleccionados no tienen controles activos'] })
        }
        const bulkData = processes.flatMap(process =>
            process.controls.map(control => ({
                id_audit_program: auditProgram.id,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        await AuditProcessControl.bulkCreate(bulkData, { transaction: t })
        const auditWithUsers = await AuditProgram.findByPk(auditProgram.id, {
            include: [
                { model: User, through: { attributes: [] }}
            ],
            transaction: t
        })
        const plain = auditWithUsers.get({ plain: true })
        const data = {...plain, processes: processes.map(p => p.get({ plain: true }))}
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updateDetailsAuditProgramById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, objectives, scope, evaluation_criteria, audited_period_start_date, audited_period_end_date, start_date, end_date } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        const company = await Company.findOne({ where: { rif : 'J-401375855' }, transaction: t })
        if (!company) {
            await t.rollback()
            return res.status(404).json({ message: ['Compañía no encontrada'] })
        }
        let fiscal_year, slug
        try {
            fiscal_year = getFiscalYear( company.fiscal_year_month, audited_period_start_date, audited_period_end_date )
            if (auditProgram.fiscal_year != fiscal_year || auditProgram.name != name) slug = await generateAuditSlug(name, fiscal_year, 'Program')
            else slug = auditProgram.slug
        } catch (error) {
            await t.rollback()
            return res.status(400).json({ message: [error.message] })
        }
        await auditProgram.update({ slug, name, objectives, scope, evaluation_criteria, fiscal_year, audited_period_start_date, audited_period_end_date, start_date, end_date }, { transaction: t })
        const data = await AuditProgram.unscoped().findByPk(auditProgram.id, { transaction: t })
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const suspendAuditProgramById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        await auditProgram.update({ status: 'Suspendido' }, { transaction: t })
        await t.commit()
        return res.json({ message: ['El programa de auditoría fue suspendido con exito'] })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const activeAuditProgramById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        let status = 'Por iniciar'
        if(auditProgram.planning_status != 'Por iniciar') status = 'En planificación'
        if(auditProgram.execution_status != 'Por iniciar') status = 'En ejecución'
        if(auditProgram.reporting_status == 'En progreso') status = 'En reporte'
        if(auditProgram.reporting_status == 'Completado') status = 'Completado'
        await auditProgram.update({ status }, { transaction: t })
        await t.commit()
        return res.json({ message: ['El programa de auditoría fue activado con exito'] })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updatePlanningStatus = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { status } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        let audit_status = 'Por iniciar'
        if(status != 'Por iniciar') audit_status = 'En planificación'
        if(status == 'Completado'){
            if(auditProgram.execution_status != 'Por iniciar') audit_status = 'En ejecución'
            if(auditProgram.reporting_status != 'Por iniciar') audit_status = 'En reporte'
            if(auditProgram.reporting_status == 'Completado') audit_status = 'Completado'
        } else {
            if(auditProgram.execution_status != 'Por iniciar') {
                await t.rollback()
                return res.status(400).json({ message: ['No se puede cambiar el estado de la planificación si ya se ha iniciado o completado la fase de ejecución'] })
            }
            if(auditProgram.reporting_status != 'Por iniciar') {
                await t.rollback()
                return res.status(400).json({ message: ['No se puede cambiar el estado de la planificación si ya se ha iniciado o completado la fase de reporte'] })
            }
        }
        await auditProgram.update({ planning_status: status, status: audit_status }, { transaction: t })
        await t.commit()
        return res.json({ message: ['El estado de la planificación fue actualizado con exito'] })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updatePlanningProcesses = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { ids_process } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        const existingRecords = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            transaction: t
        })
        const existingProcessIds = existingRecords.map(r => r.id_process)
        const toAdd = ids_process.filter(id => !existingProcessIds.includes(id))
        const toRemove = existingProcessIds.filter(id => !ids_process.includes(id))
        if (toRemove.length > 0) {
            const testUsage = await AuditTestControl.findAll({
                where: {
                    id_audit_program: auditProgram.id,
                    id_process: toRemove
                },
                transaction: t
            })
            if (testUsage.length > 0) {
                await t.rollback()
                return res.status(400).json({ message: ['No puedes eliminar procesos ya utilizados en pruebas de auditoría:',] })
            }
            await AuditProcessControl.destroy({
                where: {
                    id_audit_program: auditProgram.id,
                    id_process: toRemove
                },
                transaction: t
            })
        }
        const newProcesses = await Process.findAll({
            where: { id: toAdd },
            include: [{
                model: Control,
                through: { attributes: [] },
                where: { status: true },
                required: true
            }],
            transaction: t
        })
        if (toAdd.length != newProcesses.length) {
            await t.rollback()
            return res.status(403).json({ message: ['Algunos de los procesos nuevos no tienen controles activos'] })
        }
        const bulkData = newProcesses.flatMap(process =>
            process.controls.map(control => ({
                id_audit_program: auditProgram.id,
                id_process: process.id,
                id_control: control.id
            }))
        )
        if (bulkData.length > 0) await AuditProcessControl.bulkCreate(bulkData, { transaction: t })
        const processes = await Process.findAll({
            where: { id: ids_process },
            transaction: t
        })
        const plain = auditProgram.get({ plain: true })
        const data = { ...plain, processes: processes.map(p => p.get({ plain: true })) }
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updatePlanningControls = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { ids_control } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        const existingRecords = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            transaction: t
        })
        const existingControlIds = existingRecords.map(r => r.id_control)
        const toAdd = ids_control.filter(id => !existingControlIds.includes(id))
        const toRemove = existingControlIds.filter(id => !ids_control.includes(id))
        if (toRemove.length > 0) {
            const testUsage = await AuditTestControl.findAll({
                where: {
                    id_audit_program: auditProgram.id,
                    id_control: toRemove
                },
                transaction: t
            })
            if (testUsage.length > 0) {
                await t.rollback()
                return res.status(400).json({message: [`No puedes eliminar controles ya utilizados en pruebas de auditoría`]})
            }
            await AuditProcessControl.destroy({
                where: {
                    id_audit_program: auditProgram.id,
                    id_control: toRemove
                },
                transaction: t
            })
        }
        const newControls = await Control.findAll({
            where: { id: toAdd },
            include: [{ model: Process, through: { attributes: [] }, required: true }],
            transaction: t
        })
        const bulkData = newControls.flatMap(control =>
            control.processes.map(process => ({
                id_audit_program: auditProgram.id,
                id_process: process.id,
                id_control: control.id,
            }))
        )
        if (bulkData.length > 0) await AuditProcessControl.bulkCreate(bulkData, { transaction: t })
        const controls = await Control.findAll({
            where: { id: ids_control },
            transaction: t
        })
        const plain = auditProgram.get({ plain: true })
        const data = { ...plain, controls: controls.map(c => c.get({ plain: true })) }
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updatePlanningUsers = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { ids_user } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({
            where: condition,
            include: {
                model: User,
                through: { attributes: [] },
            },
            transaction: t
        }) 
        const currentUserIds = auditProgram.users.map(u => u.id)
        const toAdd = ids_user.filter(id => !currentUserIds.includes(id))
        const toRemove = currentUserIds.filter(id => !ids_user.includes(id))
        if (toRemove.length > 0) {
            const testUsage = await AuditTestUser.findAll({
                where: {
                    id_audit_program: auditProgram.id,
                    id_user: toRemove
                },
                transaction: t
            })
            if (testUsage.length > 0) {
                await t.rollback()
                return res.status(400).json({ message: ['No puedes eliminar usuarios ya asignados en pruebas de auditoría']})
            }
            await auditProgram.removeUsers(toRemove, { transaction: t })
        }
        await auditProgram.addUsers(toAdd, { transaction: t })
        const data = await AuditProgram.unscoped().findOne({
            where: condition,
            include: {
                model: User,
                through: { attributes: [] }
            },
            transaction: t
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const auditPlanningHeatMap = async (req, res) => { //Mapa de Calor
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            attributes: ['id_process'],
        })
        const processIds = auditProcessControls.map(p => p.id_process)
        const processes = await Process.findAll({
            where: { id: processIds },
            attributes: ['name'],
            include: [
                {
                    model: Risk,
                    attributes: ['name', 'probability', 'impact'],
                    through: { attributes: [] },
                },
            ],
        })
        const mapValue = (val, type) => {
            const mappings = {
                probability: { Baja: 1, Media: 2, Alta: 3 },
                impact: { Bajo: 1, Medio: 2, Alto: 3 },
            }
            const reverse = (num, type) => {
                if (num >= 1 && num <= 1.5) return type === 'probability' ? 'Baja' : 'Bajo'
                if (num > 1.5 && num <= 2.4) return type === 'probability' ? 'Media' : 'Medio'
                return type === 'probability' ? 'Alta' : 'Alto'
            }
            return typeof val === 'string' ? mappings[type][val] : reverse(val, type)
        }
        const levelsProb = ['Baja', 'Media', 'Alta']
        const levelsImpact = ['Bajo', 'Medio', 'Alto']
        const grouped = {}
        for (const prob of levelsProb) {
            grouped[prob] = {}
            for (const impact of levelsImpact) {
                const avg = (mapValue(prob, 'probability') + mapValue(impact, 'impact')) / 2
                const adjusted = avg === 1.5 ? 1 : avg === 2.5 ? 3 : avg
                grouped[prob][impact] = {
                    data: adjusted,
                    metadata: {
                        total_count: 0,
                        processes: '',
                    },
                }
            }
        }
        for (const process of processes) {
            const risks = process.risks
            if (!risks.length) continue
            const probabilities = risks.map(r => mapValue(r.probability, 'probability'))
            const impacts = risks.map(r => mapValue(r.impact, 'impact'))
            const avgProb = probabilities.reduce((a, b) => a + b, 0) / probabilities.length
            const avgImpact = impacts.reduce((a, b) => a + b, 0) / impacts.length
            const probKey = mapValue(avgProb, 'probability')
            const impactKey = mapValue(avgImpact, 'impact')
            const entry = grouped[probKey][impactKey]
            entry.metadata.total_count += 1
            entry.metadata.processes += entry.metadata.processes ? `, ${process.name}` : process.name
        }
        const data = levelsProb.map(prob => ({
            key: prob,
            data: levelsImpact.map(impact => ({
                key: impact,
                data: grouped[prob][impact].data,
                metadata: {
                    total_count: grouped[prob][impact].metadata.total_count,
                    processes: grouped[prob][impact].metadata.processes,
                },
            })),
        }))
        res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}
export const getPlanningUser = async (req, res) => {
    try {
        const { id, userId } = req.params
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({
            where: condition,
            attributes: [],
            include: {
                model: User.unscoped(),
                where: { id: userId },
                through: { attributes: ['planning_requirements_hours', 'test_execution_hours', 'document_evidence_hours', 'document_findings_hours', 'report_preparation_hours', 'report_revision_hours'] },
                include: [ { model: Role.unscoped(), attributes: ['name'], } ],
                required: false
            },
        }) 
        const user = auditProgram.users[0]
        const data = {...user.get({ plain: true }),}
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}
export const updatePlanningUser = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { id, userId } = req.params
        const { planning_requirements_hours, test_execution_hours, document_evidence_hours, document_findings_hours, report_preparation_hours, report_revision_hours } = req.body
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({
            where: condition,
            include: { model: User, where: { id: userId }, },
            transaction: t
        }) 
        await AuditUser.update({ planning_requirements_hours, test_execution_hours, document_evidence_hours, document_findings_hours, report_preparation_hours, report_revision_hours }, 
        { where: { id_audit_program: auditProgram.id, id_user: userId }, transaction: t })
        const auditParticipant = await AuditProgram.unscoped().findOne({
            where: condition,
            attributes: [],
            include: {
                model: User,
                where: { id: userId },
                through: { attributes: ['planning_requirements_hours', 'test_execution_hours', 'document_evidence_hours', 'document_findings_hours', 'report_preparation_hours', 'report_revision_hours'] },
                include: [ { model: Role, attributes: ['name'], } ],
                required: false
            },
            transaction: t
        })
        const user = auditParticipant.users[0]
        const data = {...user.get({ plain: true }),}
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}
export const updateExecutionStatus = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { status } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        let audit_status = 'En planificación'
        if(status != 'Por iniciar') audit_status = 'En ejecución'
        if(status == 'Completado'){
            if(auditProgram.reporting_status != 'Por iniciar') audit_status = 'En reporte'
            if(auditProgram.reporting_status == 'Completado') audit_status = 'Completado'
        } else {
            if(auditProgram.reporting_status != 'Por iniciar') {
                await t.rollback()
                return res.status(400).json({ message: ['No se puede cambiar el estado de la ejecución si ya se ha iniciado o completado la fase de reporte'] })
            }
        }
        await auditProgram.update({ execution_status: status, status: audit_status }, { transaction: t })
        await t.commit()
        return res.json({ message: ['El estado de la ejecución fue actualizado con exito'] })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const updateReportStatus = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { status } = req.body
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        let audit_status = 'En ejecución'
        if (status != 'Por iniciar') audit_status = 'En reporte'
        if (status == 'Completado') audit_status = 'Completado'
        await auditProgram.update({ reporting_status: status, status: audit_status }, { transaction: t })
        await t.commit()
        return res.json({ message: ['El estado de la fase de reporte fue actualizado con exito'] })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const updateResultsReport = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { report_title, report_introduction, report_audit_summary, report_auditor_opinion, report_conclusion } = req.body
        const data = await AuditProgram.unscoped().findOne({ where: condition, transaction: t })
        await data.update({ report_title, report_introduction, report_audit_summary, report_auditor_opinion, report_conclusion }, { transaction: t })
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getKpiReportDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const condition = validateUUID(id) ? { id } : { slug: id }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditFindingsControl = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: AuditFinding, where: { status: true }, },
                { model: Control.unscoped() },
                { model: Process.unscoped() },
            ],
        });
        const findings = [...new Map(auditFindingsControl.filter(p => p.audit_finding).map(p => [p.audit_finding.id, p.audit_finding.get({ plain: true })])).values()]
        const totalFindings = findings.length
        const conformingFindings = findings.filter(f => f.finding_type === 'Conforme').length
        const nonConformingFindings = findings.filter(f => f.finding_type === 'No conforme').length
        const criticalFindingsCount = findings.filter(f => f.classification === 'Crítico').length
        const criticalFindingsPercentage = totalFindings > 0 ? (criticalFindingsCount / totalFindings) * 100 : 0
        const deficientControlsMap = new Map()
        auditFindingsControl.forEach(f => {
            if (f.audit_finding.finding_type === 'No conforme' && f.control) 
                deficientControlsMap.set(f.control.id, f.control.get({ plain: true }))
        })
        const deficientControls = [...deficientControlsMap.values()]
        const affectedProcessesMap = new Map()
        auditFindingsControl.forEach(f => {
            if (f.process) {
                affectedProcessesMap.set(f.process.id, f.process.get({ plain: true }))
            }
        })
        const affectedProcesses = [...affectedProcessesMap.values()]
        return res.json({
            data: {
                total_findings: totalFindings,
                conforming_findings: conformingFindings,
                no_conforming_findings: nonConformingFindings,
                critical_findings_percentage: criticalFindingsPercentage.toFixed(2),
                deficient_controles: deficientControls.length,
                affected_processes: affectedProcesses.length,
            }
        })
    } catch (error) {
        serverError(res, error)
    }
}

export const getPieChartReportDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const condition = validateUUID(id) ? { id } : { slug: id };
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditFindingsControl = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: AuditFinding, where: { status: true } }
            ],
        })
        const findings = [...new Map(auditFindingsControl.filter(f => f.audit_finding).map(f => [f.audit_finding.id, f.audit_finding.get({ plain: true })])).values()]
        const totalFindings = findings.length
        const conforming = findings.filter(f => f.finding_type === 'Conforme').length
        const nonConforming = findings.filter(f => f.finding_type === 'No conforme').length
        const conformingPercentage = totalFindings > 0 ? (conforming / totalFindings) * 100 : 0
        const nonConformingPercentage = totalFindings > 0 ? (nonConforming / totalFindings) * 100 : 0
        return res.json({
            data: [
                {
                    label: 'Conformes',
                    value: parseFloat(conformingPercentage.toFixed(2)),
                },
                {
                    label: 'No conformes',
                    value: parseFloat(nonConformingPercentage.toFixed(2)),
                }
            ]
        })
    } catch (error) {
        serverError(res, error)
    }
}

export const getBarChartFindingsReportDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const condition = validateUUID(id) ? { id } : { slug: id };
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditFindingsControl = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: AuditFinding, where: { status: true } }
            ],
        })
        const findings = [...new Map(auditFindingsControl.filter(f => f.audit_finding).map(f => [f.audit_finding.id, f.audit_finding.get({ plain: true })])).values()]
        const minorFindings = findings.filter(f => f.classification === 'Menor').length
        const moderateFindings = findings.filter(f => f.classification === 'Moderado').length
        const importantFindings = findings.filter(f => f.classification === 'Importante').length
        const criticalFindings = findings.filter(f => f.classification === 'Crítico').length
        return res.json({
            data: [
                {
                    findings: minorFindings,
                    classification: 'Menores',
                },
                {
                    findings: moderateFindings,
                    classification: 'Moderados',
                },
                {
                    findings: importantFindings,
                    classification: 'Importantes',
                },
                {
                    findings: criticalFindings,
                    classification: 'Críticos',
                }
            ]
        })
    } catch (error) {
        serverError(res, error)
    }
}

export const getBarChartControlsReportDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const condition = validateUUID(id) ? { id } : { slug: id };
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        const auditControls = await AuditProcessControl.findAll({ 
            where: { id_audit_program: auditProgram.id },
            include: [{ model: Control }],
        })
        const auditFindingsControl = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                { model: AuditFinding, where: { status: true } },
                { model: Control.unscoped() },
            ],
        })
        const deficientControlsMap = new Map()
        auditFindingsControl.forEach(f => {
            if (f.audit_finding.finding_type === 'No conforme' && f.control)
                deficientControlsMap.set(f.control.id, f.control.get({ plain: true }))
        })
        const allControlsMap = new Map()
        auditControls.forEach(ac => {
            if (ac.control) 
                allControlsMap.set(ac.control.id, ac.control.get({ plain: true }))
        })
        const effectiveControlsMap = new Map(
            [...allControlsMap].filter(([id]) => !deficientControlsMap.has(id))
        )
        return res.json({
            data: [
                {
                    controls: effectiveControlsMap.size,
                    classification: 'Efectivos',
                },
                {
                    controls: deficientControlsMap.size,
                    classification: 'Deficientes',
                }
            ]
        })
    } catch (error) {
        serverError(res, error);
    }
}