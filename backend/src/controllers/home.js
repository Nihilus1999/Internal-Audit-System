import { Process } from '../models/process.js'
import { User } from '../models/user.js'
import { Risk } from '../models/risk.js'
import { Event } from '../models/event.js'
import { Control } from '../models/control.js'
import { ActionPlan } from '../models/actionPlan.js'
import { AuditProgram } from '../models/auditProgram.js'
import { serverError } from '../helpers/handleServerError.js'

export const heatMap = async (req, res) => { //Mapa de Calor
    try {
        const processes = await Process.findAll({
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

export const totalCounts = async (req, res) => {
    try {
        const [
            processCount,
            userCount,
            riskCount,
            eventCount,
            controlCount,
            actionPlanCount,
            auditProgramCount
        ] = await Promise.all([
            Process.count(),
            User.count(),
            Risk.count(),
            Event.count(),
            Control.count(),
            ActionPlan.count(),
            AuditProgram.count()
        ])
        const data = {
            processes: processCount,
            users: userCount,
            risks: riskCount,
            events: eventCount,
            controls: controlCount,
            actionPlans: actionPlanCount,
            auditPrograms: auditProgramCount
        }
        res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}