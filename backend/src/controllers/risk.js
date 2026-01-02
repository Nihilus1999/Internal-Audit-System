import { Risk } from '../models/risk.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { AuditProgram } from '../models/auditProgram.js'
import { AuditProcessControl } from '../models/auditProcessControl.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
import {sequelize}  from '../database/database.js'
import { Op } from 'sequelize'

export const getRisks = async (req, res) => {
    try {
        const risks = await Risk.unscoped().findAll({
            include: [
                { model: Process.unscoped(), through: { attributes: [] } },
                { model: Control, through: { attributes: [] }, required: false }
            ],
            order: [['created_at', 'ASC']]
        })
        const data = risks.map(risk => {
            const probMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 }
            const impactMap = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 }
            const probValue = probMap[risk.probability] || 0
            const impactValue = impactMap[risk.impact] || 0
            const inherentRiskScore = (probValue + impactValue) / 2
            let inherentRisk
            if (inherentRiskScore <= 1.5) {
                inherentRisk = 'Bajo'
            } else if (inherentRiskScore < 2.5) {
                inherentRisk = 'Medio'
            } else {
                inherentRisk = 'Alto'
            }
            const effectivenessValues = risk.controls?.map(control => {
                switch (control.teoric_effectiveness) {
                    case 'Óptimo':
                        return 3
                    case 'Aceptable':
                        return 1
                    case 'Deficiente':
                        return 0
                    default:
                        return 0
                }
            }) || []
            const controlEffectivenessScore = effectivenessValues.length > 0
                ? effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length
                : 0
            let controlsEffectiveness
            if (controlEffectivenessScore < 1) {
                controlsEffectiveness = 'Deficiente'
            } else if (controlEffectivenessScore < 2.5) {
                controlsEffectiveness = 'Aceptable'
            } else {
                controlsEffectiveness = 'Óptimo'
            }
            const residualRiskScore = inherentRiskScore - controlEffectivenessScore
            let residualRisk
            if (residualRiskScore <= 1.5) {
                residualRisk = 'Bajo'
            } else if (residualRiskScore < 2.5) {
                residualRisk = 'Medio'
            } else {
                residualRisk = 'Alto'
            }
            return {...risk.toJSON(), inherentRiskScore, inherentRisk, controlEffectivenessScore, controlsEffectiveness, residualRiskScore, residualRisk }
        })
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const getRiskById = async (req, res) => {
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const risk = await Risk.unscoped().findOne({
            where: condition,
            include: [
                { model: Process.unscoped(), through: { attributes: [] } },
                { model: Control, through: { attributes: [] }, required: false }
            ]
        })
        if (!risk) return res.status(404).json({ message: ['El riesgo no fue encontrado'] })
        const probMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 }
        const impactMap = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 }
        const probValue = probMap[risk.probability] || 0
        const impactValue = impactMap[risk.impact] || 0
        const inherentRiskScore = (probValue + impactValue) / 2
        let inherentRisk
        if (inherentRiskScore <= 1.5) {
            inherentRisk = 'Bajo'
        } else if (inherentRiskScore < 2.5) {
            inherentRisk = 'Medio'
        } else {
            inherentRisk = 'Alto'
        }
        const effectivenessValues = risk.controls?.map(control => {
            switch (control.teoric_effectiveness) {
                case 'Óptimo':
                    return 3
                case 'Aceptable':
                    return 1
                case 'Deficiente':
                    return 0
                default:
                    return 0
            }
        }) || []
        const controlEffectivenessScore = effectivenessValues.length > 0
            ? effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length
            : 0
        let controlsEffectiveness
        if (controlEffectivenessScore < 1) {
            controlsEffectiveness = 'Deficiente'
        } else if (controlEffectivenessScore < 2.5) {
            controlsEffectiveness = 'Aceptable'
        } else {
            controlsEffectiveness = 'Óptimo'
        }
        const residualRiskScore = inherentRiskScore - controlEffectivenessScore
        let residualRisk
        if (residualRiskScore <= 1.5) {
            residualRisk = 'Bajo'
        } else if (residualRiskScore < 2.5) {
            residualRisk = 'Medio'
        } else {
            residualRisk = 'Alto'
        }
        return res.json({ data: {...risk.toJSON(), inherentRiskScore, inherentRisk, controlEffectivenessScore, controlsEffectiveness, residualRiskScore, residualRisk } })
    } catch (error) {
        serverError(res, error)
    }
}

export const createRisk = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { name, description, risk_source, risk_origin, possible_consequences, probability, impact, ids_process, ids_control } = req.body
        const totalCount = await Risk.unscoped().count({ paranoid: false, transaction: t })
        const slug = `risk-${totalCount + 1}`    
        const risk = await Risk.create({ slug, name, description, risk_source, origin: risk_origin, possible_consequences, probability, impact }, { transaction: t })
        await risk.setProcesses(ids_process, { transaction: t })
        if (ids_control) await risk.setControls(ids_control, { transaction: t }) 
        const data = await Risk.findByPk(risk.id, {
            include: [
                { model: Process, through: { attributes: [] } },
                { model: Control, through: { attributes: [] }, required: false }
            ],
            transaction: t,
        })
        await t.commit()
        return res.json({ data })
    } catch(error) {
        await t.rollback()
        serverError(res, error)
    }
}


export const patchRiskById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id = req.params.id
        const condition = validateUUID(id) ? { id } : { slug: id }
        const { name, description, risk_source, risk_origin, possible_consequences, probability, impact, status, ids_process, ids_control } = req.body
        const risk = await Risk.unscoped().findOne({ where: condition, transaction: t })
        if (!risk) {
            await t.rollback()
            return res.status(404).json({ message: ['El riesgo no fue encontrado'] })
        }
        // Apartado: Datos Generales
        if (name && description && risk_source && risk_origin && possible_consequences && status !== undefined) {
            await risk.update({ name, description, risk_source, origin: risk_origin, possible_consequences, status }, { transaction: t })
        }
        // Apartado: Procesos Afectados
        if (ids_process) {
            await risk.setProcesses(ids_process, { transaction: t })
        }
        // Apartado: Controles
        if (ids_control) {
            await risk.setControls(ids_control, { transaction: t })
        }
        // Apartado: Evaluación del Riesgo
        if (probability && impact) {
            await risk.update({ probability, impact }, { transaction: t })
        }
        const data = await Risk.unscoped().findByPk(risk.id, {
            include: [
                { model: Process, through: { attributes: [] } },
                { model: Control, through: { attributes: [] }, required: false }
            ],
            transaction: t
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getRisksFiltered = async (req, res) => {
    try {
        const { origin, probability, impact, inherent_risk: inherentFilter, residual_risk: residualFilter } = req.query
        const risks = await Risk.findAll({
            attributes: ['id', 'slug', 'name', 'origin', 'probability', 'impact'],
            include: [
                { model: Control, through: { attributes: [] }, required: false }
            ],
            where: {
                ...(origin && { origin: { [Op.iLike]: `%${origin}%` } }),
                ...(probability && { probability }),
                ...(impact && { impact })
            },
            order: [['created_at', 'ASC']]
        })
        // Mapas de equivalencias
        const probMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 }
        const impactMap = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 }
        // Calcular riesgo inherente y residual (solo para filtrar)
        let data = risks.map(risk => {
            const probValue = probMap[risk.probability] || 0
            const impactValue = impactMap[risk.impact] || 0
            const inherentRiskScore = (probValue + impactValue) / 2
            let inherentLabel
            if (inherentRiskScore <= 1.5) inherentLabel = 'Bajo'
            else if (inherentRiskScore < 2.5) inherentLabel = 'Medio'
            else inherentLabel = 'Alto'
            const effectivenessValues = risk.controls?.map(control => {
                switch (control.teoric_effectiveness) {
                    case 'Óptimo': return 3
                    case 'Aceptable': return 1
                    case 'Deficiente': return 0
                    default: return 0
                }
            }) || []
            const controlEffectivenessScore = effectivenessValues.length
                ? effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length
                : 0
            const residualScore = inherentRiskScore - controlEffectivenessScore
            let residualLabel
            if (residualScore <= 1.5) residualLabel = 'Bajo'
            else if (residualScore < 2.5) residualLabel = 'Medio'
            else residualLabel = 'Alto'
            return {
                slug: risk.slug,
                name: risk.name,
                inherentLabel,
                residualLabel
            }
        })
        // Aplicar filtros adicionales
        if (inherentFilter) {
            data = data.filter(r =>
                r.inherentLabel.toLowerCase().includes(inherentFilter.toLowerCase())
            )
        }
        if (residualFilter) {
            data = data.filter(r =>
                r.residualLabel.toLowerCase().includes(residualFilter.toLowerCase())
            )
        }
        // Solo devolver slug y name
        const result = data.map(r => ({
            slug: r.slug,
            name: r.name
        }))
        return res.json({ data: result })
    } catch (error) {
        serverError(res, error)
    }
}

export const getAuditRisksFiltered = async (req, res) => {
    try {
        const { name, fiscal_year, origin, probability, impact, inherent_risk: inherentFilter, residual_risk: residualFilter } = req.query
        if (!name || !fiscal_year) {
            return res.status(400).json({ message: ['Debe proporcionar name y fiscal_year como query params'] })
        }
        // Buscar programa de auditoría
        const auditProgram = await AuditProgram.findOne({
            where: {
                name: { [Op.iLike]: name },
                fiscal_year,
                status: { [Op.ne]: 'Suspendido' }
            }
        })
        if (!auditProgram) {
            return res.status(404).json({ message: ['Programa de auditoría no encontrado'] })
        }
        // Buscar riesgos asociados al programa (sin filtrar por slug ni name)
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                {
                    model: Process.unscoped(),
                    include: [
                        {
                            model: Risk,
                            attributes: ['id', 'slug', 'name', 'origin', 'probability', 'impact'],
                            through: { attributes: [] },
                            include: [{ model: Control, through: { attributes: [] }, required: false }],
                            where: {
                                ...(origin && { origin: { [Op.iLike]: `%${origin}%` } }),
                                ...(probability && { probability }),
                                ...(impact && { impact })
                            }
                        }
                    ]
                }   
            ]
        })
        // Mapas de equivalencias
        const probMap = { Alta: 3, Media: 2, Baja: 1 }
        const impactMap = { Alto: 3, Medio: 2, Bajo: 1 }
        const risksMap = new Map()
        // Recorremos procesos y calculamos etiquetas de riesgo
        for (const apc of auditProcessControls) {
            if (!apc.process) continue
            for (const risk of apc.process.risks || []) {
                if (risksMap.has(risk.id)) continue
                const probValue = probMap[risk.probability] || 0
                const impactValue = impactMap[risk.impact] || 0
                const inherentRiskScore = (probValue + impactValue) / 2
                let inherentLabel
                if (inherentRiskScore <= 1.5) inherentLabel = 'Bajo'
                else if (inherentRiskScore < 2.5) inherentLabel = 'Medio'
                else inherentLabel = 'Alto'
                const effectivenessValues =
                    risk.controls?.map(control => {
                        switch (control.teoric_effectiveness) {
                            case 'Óptimo': return 3
                            case 'Aceptable': return 1
                            case 'Deficiente': return 0
                            default: return 0
                        }
                    }) || []
                const controlEffectivenessScore = effectivenessValues.length
                    ? effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length
                    : 0
                const residualScore = inherentRiskScore - controlEffectivenessScore
                let residualLabel
                if (residualScore <= 1.5) residualLabel = 'Bajo'
                else if (residualScore < 2.5) residualLabel = 'Medio'
                else residualLabel = 'Alto'
                risksMap.set(risk.id, {
                    slug: risk.slug,
                    name: risk.name,
                    inherentLabel,
                    residualLabel
                })
            }
        }
        // Convertir a array y aplicar filtros adicionales
        let risks = Array.from(risksMap.values())
        if (inherentFilter) {
            risks = risks.filter(r =>
                r.inherentLabel.toLowerCase().includes(inherentFilter.toLowerCase())
            )
        }
        if (residualFilter) {
            risks = risks.filter(r =>
                r.residualLabel.toLowerCase().includes(residualFilter.toLowerCase())
            )
        }
        // Solo devolver slug y name
        const result = risks.map(r => ({
            slug: r.slug,
            name: r.name
        }))
        return res.json({ data: result })
    } catch (error) {
        serverError(res, error)
    }
}


