import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { Risk } from '../models/risk.js'
import { Control } from '../models/control.js'
import { Process } from '../models/process.js'
import { AuditProcessControl } from '../models/auditProcessControl.js'
import { AuditFindingControl } from '../models/auditFindingControl.js'
import { AuditFinding } from '../models/auditFinding.js'
import { serverError } from '../helpers/handleServerError.js'
import { Op } from 'sequelize'

export const getAuditHoursBudget = async (req, res) => {
    try {
        const { name, fiscal_year, user_name, role } = req.query
        if (!name || !fiscal_year) {
            return res.status(400).json({ message: ['Debe proporcionar name y fiscal_year como query params'] })
        }
        let userWhere = undefined
        if (user_name) {
            const words = user_name.trim().split(' ').filter(Boolean)
            userWhere = {
                [Op.and]: words.map(w => ({
                    [Op.or]: [
                        { first_name: { [Op.iLike]: `%${w}%` } },
                        { last_name: { [Op.iLike]: `%${w}%` } }
                    ]
                }))
            }
        }
        const auditProgram = await AuditProgram.findOne({
            where: {
                name: { [Op.iLike]: name }, // búsqueda case-insensitive
                fiscal_year,
                status: { [Op.ne]: 'Suspendido' }
            },
            include: [
                {
                    model: User.unscoped(),
                    attributes: ['id', 'first_name', 'last_name'],
                    where: userWhere,
                    through: {
                        attributes: [
                            'planning_requirements_hours',
                            'test_execution_hours',
                            'document_evidence_hours',
                            'document_findings_hours',
                            'report_preparation_hours',
                            'report_revision_hours'
                        ]
                    },
                    include: [ 
                        {
                            model: Role.unscoped(), 
                            attributes: ['name']
                        } 
                    ]
                }
            ]
        })
        const plain = auditProgram?.get({ plain: true })
        // Filtramos usuarios por role si se pasó
        const users = plain?.users?.filter(u =>
            !role || u.role && u.role?.name.toLowerCase() === role.toLowerCase()
        )
        if (!plain || !users?.length) {
            return res.status(404).json({ message: ['Programa de auditoría no encontrado con los filtros especificados'] })
        }
        // usuarios con sus roles y horas
        const formattedUsers = users.map(user => {
            const auditParticipant = user.audit_participant || {}
            const total = 
                (auditParticipant.planning_requirements_hours || 0) +
                (auditParticipant.test_execution_hours || 0) +
                (auditParticipant.document_evidence_hours || 0) +
                (auditParticipant.document_findings_hours || 0) +
                (auditParticipant.report_preparation_hours || 0) +
                (auditParticipant.report_revision_hours || 0)
            return {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role ? user.role.name : null,
                planning_requirements_hours: auditParticipant.planning_requirements_hours || 0,
                test_execution_hours: auditParticipant.test_execution_hours || 0,
                document_evidence_hours: auditParticipant.document_evidence_hours || 0,
                document_findings_hours: auditParticipant.document_findings_hours || 0,
                report_preparation_hours: auditParticipant.report_preparation_hours || 0,
                report_revision_hours: auditParticipant.report_revision_hours || 0,
                total_hours: total
            }
        })
        const total_hours = formattedUsers.reduce((acc, u) => acc + u.total_hours, 0)
        const data = {
            id: plain.id,
            name: plain.name,
            fiscal_year: plain.fiscal_year,
            users: formattedUsers,
            total_hours
        }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const getRisksMatrix = async (req, res) => {
    try {
        const { slug, name, origin, probability, impact, inherent_risk: inherentFilter, residual_risk: residualFilter } = req.query;
        // Traemos riesgos con controles para calcular efectividad
        const risks = await Risk.findAll({
            attributes: ['id', 'slug', 'name', 'risk_source', 'origin', 'description', 'probability', 'impact'],
            include: [
                { model: Control, through: { attributes: [] }, required: false }
            ],
            where: {
                ...(slug && { slug }),
                ...(name && { name: { [Op.iLike]: `%${name}%` } }),
                ...(origin && { origin: { [Op.iLike]: `%${origin}%` } }),
                ...(probability && { probability }),
                ...(impact && { impact })
            },
            order: [['created_at', 'ASC']]
        })
        const probMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 }
        const impactMap = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 }
        let data = risks.map(risk => {
            const probValue = probMap[risk.probability] || 0
            const impactValue = impactMap[risk.impact] || 0
            const inherentRiskScore = (probValue + impactValue) / 2
            // inherent_risk
            let inherentLabel
            if (inherentRiskScore <= 1.5) inherentLabel = 'Bajo'
            else if (inherentRiskScore < 2.5) inherentLabel = 'Medio'
            else inherentLabel = 'Alto'
            const inherent_risk = `${inherentLabel} (${inherentRiskScore.toFixed(2)})`
            // controls_effectiveness
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
            let controlsLabel
            if (controlEffectivenessScore < 1) controlsLabel = 'Deficiente'
            else if (controlEffectivenessScore < 2.5) controlsLabel = 'Aceptable'
            else controlsLabel = 'Óptimo'
            const controls_effectiveness = `${controlsLabel} (${controlEffectivenessScore.toFixed(2)})`
            // residual_risk
            const residualScore = inherentRiskScore - controlEffectivenessScore
            let residualLabel
            if (residualScore <= 1.5) residualLabel = 'Bajo'
            else if (residualScore < 2.5) residualLabel = 'Medio'
            else residualLabel = 'Alto'
            const residual_risk = `${residualLabel} (${residualScore.toFixed(2)})`
            return {
                id: risk.id,
                slug: risk.slug,
                name: risk.name,
                origin: risk.origin,
                risk_source: risk.risk_source,
                description: risk.description,
                probability: risk.probability,
                impact: risk.impact,
                inherent_risk,
                controls_effectiveness,
                residual_risk
            }
        })
        if (inherentFilter) {
            data = data.filter(r => r.inherent_risk.toLowerCase().includes(inherentFilter.toLowerCase()));
        }
        if (residualFilter) {
            data = data.filter(r => r.residual_risk.toLowerCase().includes(residualFilter.toLowerCase()));
        }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const getAuditRisksMatrix = async (req, res) => {
    try {
        const {
            name, fiscal_year, slug, risk_name,
            origin, probability, impact,
            inherent_risk: inherentFilter, residual_risk: residualFilter
        } = req.query;
        if (!name || !fiscal_year) {
            return res.status(400).json({ message: ['Debe proporcionar name y fiscal_year como query params'] });
        }
        // Buscamos el programa de auditoría
        const auditProgram = await AuditProgram.findOne({
            where: {
                name: { [Op.iLike]: name },
                fiscal_year,
                status: { [Op.ne]: 'Suspendido' }
            }
        });
        if (!auditProgram) {
            return res.status(404).json({ message: ['Programa de auditoría no encontrado'] });
        }
        // Buscamos los procesos asociados a este programa
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [
                {
                    model: Process.unscoped(),
                    include: [
                        {
                            model: Risk,
                            attributes: [
                                'id', 'slug', 'name', 'risk_source',
                                'origin', 'description', 'probability', 'impact'
                            ],
                            through: { attributes: [] },
                            include: [{ model: Control, through: { attributes: [] }, required: false }],
                            where: {
                                ...(slug && { slug }),
                                ...(risk_name && { name: { [Op.iLike]: `%${risk_name}%` } }),
                                ...(origin && { origin: { [Op.iLike]: `%${origin}%` } }),
                                ...(probability && { probability }),
                                ...(impact && { impact })
                            }
                        }
                    ]
                }
            ]
        });
        // Mapas de valores
        const probMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
        const impactMap = { 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
        const risksMap = new Map();
        // Recorremos los procesos y riesgos
        for (const apc of auditProcessControls) {
            if (!apc.process) continue;
            for (const risk of apc.process.risks || []) {
                if (risksMap.has(risk.id)) continue;
                const probValue = probMap[risk.probability] || 0;
                const impactValue = impactMap[risk.impact] || 0;
                const inherentRiskScore = (probValue + impactValue) / 2;
                // Cálculo de riesgo inherente
                let inherentLabel;
                if (inherentRiskScore <= 1.5) inherentLabel = 'Bajo';
                else if (inherentRiskScore < 2.5) inherentLabel = 'Medio';
                else inherentLabel = 'Alto';
                const inherent_risk = `${inherentLabel} (${inherentRiskScore.toFixed(2)})`;
                // Efectividad de controles
                const effectivenessValues = risk.controls?.map(control => {
                    switch (control.teoric_effectiveness) {
                        case 'Óptimo': return 3;
                        case 'Aceptable': return 1;
                        case 'Deficiente': return 0;
                        default: return 0;
                    }
                }) || [];
                const controlEffectivenessScore = effectivenessValues.length
                    ? effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length
                    : 0;
                let controlsLabel;
                if (controlEffectivenessScore < 1) controlsLabel = 'Deficiente';
                else if (controlEffectivenessScore < 2.5) controlsLabel = 'Aceptable';
                else controlsLabel = 'Óptimo';
                const controls_effectiveness = `${controlsLabel} (${controlEffectivenessScore.toFixed(2)})`;
                // Riesgo residual
                const residualScore = inherentRiskScore - controlEffectivenessScore;
                let residualLabel;
                if (residualScore <= 1.5) residualLabel = 'Bajo';
                else if (residualScore < 2.5) residualLabel = 'Medio';
                else residualLabel = 'Alto';
                const residual_risk = `${residualLabel} (${residualScore.toFixed(2)})`;
                risksMap.set(risk.id, {
                    id: risk.id,
                    slug: risk.slug,
                    name: risk.name,
                    origin: risk.origin,
                    risk_source: risk.risk_source,
                    description: risk.description,
                    probability: risk.probability,
                    impact: risk.impact,
                    inherent_risk,
                    controls_effectiveness,
                    residual_risk
                });
            }
        }
        // Convertimos map a array y aplicamos filtros adicionales
        let risks = Array.from(risksMap.values());
        if (inherentFilter)
            risks = risks.filter(r => r.inherent_risk.toLowerCase().includes(inherentFilter.toLowerCase()));
        if (residualFilter)
            risks = risks.filter(r => r.residual_risk.toLowerCase().includes(residualFilter.toLowerCase()));
        const data = {
            id: auditProgram.id,
            name: auditProgram.name,
            fiscal_year: auditProgram.fiscal_year,
            risks
        };
        return res.json({ data });
    } catch (error) {
        serverError(res, error);
    }
};

export const getAuditPlan = async (req, res) => {
    try {
        const {
            name, fiscal_year,
            title, objective, scope, evaluation_criteria,
            start_date, estimated_hours
        } = req.query
        if (!name || !fiscal_year) {
            return res.status(400).json({
                message: ['Debe especificar el nombre del programa y el año fiscal'],
            })
        }
        // Buscar programa activo
        const auditProgram = await AuditProgram.findOne({
            where: {
                name: { [Op.iLike]: name },
                fiscal_year,
                status: { [Op.ne]: 'Suspendido' },
            },
        })
        if (!auditProgram) {
            return res.status(404).json({
                message: ['Programa de auditoría no encontrado con los parámetros especificados'],
            })
        }
        // Armar condiciones dinámicas
        const whereClause = {
            id_audit_program: auditProgram.id,
            status: { [Op.ne]: 'Suspendido' },
            ...(title && { title: { [Op.iLike]: `%${title}%` } }),
            ...(objective && { objective: { [Op.iLike]: `%${objective}%` } }),
            ...(scope && { scope: { [Op.iLike]: `%${scope}%` } }),
            ...(evaluation_criteria && { evaluation_criteria: { [Op.iLike]: `%${evaluation_criteria}%` } }),
            ...(estimated_hours && { estimated_hours }),
        }
        // Buscar pruebas asociadas al programa (no suspendidas)
        const auditTests = await AuditTest.findAll({
            where: whereClause,
            attributes: [
                'id',
                'title',
                'objective',
                'scope',
                'evaluation_criteria',
                'start_date',
                'estimated_hours',
            ],
            order: [['created_at', 'ASC']],
        })
        // Formatear fecha a dd/MM/yyyy
        let tests = auditTests.map(test => {
            const plain = test.get({ plain: true })
            const startDate = plain.start_date
            ? new Date(plain.start_date).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : null
            return {
                id: plain.id,
                title: plain.title,
                objective: plain.objective,
                scope: plain.scope,
                evaluation_criteria: plain.evaluation_criteria,
                start_date: startDate,
                estimated_hours: plain.estimated_hours,
            }
        })
        if (start_date) {
            tests = tests.filter(t => t.start_date === start_date)
        }
        const total_hours = tests.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0 )
        const data = {
            id: auditProgram.id,
            name: auditProgram.name,
            fiscal_year: auditProgram.fiscal_year,
            tests,
            total_hours
        }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}


export const getAuditResultsReport = async (req, res) => {
    try {
        const { name, fiscal_year } = req.query
        if (!name || !fiscal_year) {
            return res.status(400).json({ message: ['Debe especificar el nombre del programa y el año fiscal'],})
        }
        // Buscar programa activo
        const auditProgram = await AuditProgram.findOne({
            where: {
                name: { [Op.iLike]: name },
                fiscal_year,
                status: { [Op.ne]: 'Suspendido' },
            },
            attributes: [
                'id',
                'name',
                'fiscal_year',
                'report_title',
                'report_introduction',
                'objectives',
                'scope',
                'evaluation_criteria',
                'report_audit_summary',
                'report_auditor_opinion',
                'report_conclusion',
                'execution_status'
            ],
        })
        if (!auditProgram) {
            return res.status(404).json({
                message: ['Programa de auditoría no encontrado con los parámetros especificados'],
            })
        }
        if (auditProgram.execution_status !== 'Completado') {
            return res.status(409).json({
                message: ['El informe de resultados solo está disponible para programas con ejecución completada'],
            })
        }
        if (
            !auditProgram.report_title?.trim() ||
            !auditProgram.report_introduction?.trim() ||
            !auditProgram.report_audit_summary?.trim() ||
            !auditProgram.report_auditor_opinion?.trim() ||
            !auditProgram.report_conclusion?.trim()
        ) {
            return res.status(412).json({
                message: ['Los campos del informe de resultados no pueden estar vacíos'],
            })
        }
        // Obtener procesos vinculados al programa
        const auditProcessControls = await AuditProcessControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [{ model: Process.unscoped() }],
        })
        // Extraer procesos únicos
        const processes = [
            ...new Map(
                auditProcessControls
                    .filter(apc => apc.process)
                    .map(apc => [apc.process.id, {
                        id: apc.process.id,
                        name: apc.process.name,
                        description: apc.process.description,
                        objective: apc.process.objective,
                    }])).values(),
        ]
        // Obtener hallazgos vinculados al programa
        const auditFindingControls = await AuditFindingControl.findAll({
            where: { id_audit_program: auditProgram.id },
            include: [{ model: AuditFinding.unscoped() }],
        })
        // Extraer hallazgos únicos
        const audit_findings = [
            ...new Map(
                auditFindingControls
                    .filter(p => p.audit_finding)
                    .map(p => [p.audit_finding.id, {
                        id: p.audit_finding.id,
                        title: p.audit_finding.title,
                        root_cause: p.audit_finding.root_cause,
                        finding_type: p.audit_finding.finding_type,
                        classification: p.audit_finding.classification,
                        observations: p.audit_finding.observations,
                    }])).values(),
        ]
        // Preparar respuesta
        const plain = auditProgram.get({ plain: true })
        const data = {
            id: plain.id,
            name: plain.name,
            fiscal_year: plain.fiscal_year,
            report_title: plain.report_title,
            report_introduction: plain.report_introduction,
            objectives: plain.objectives,
            scope: plain.scope,
            evaluation_criteria: plain.evaluation_criteria,
            report_audit_summary: plain.report_audit_summary,
            report_auditor_opinion: plain.report_auditor_opinion,
            report_conclusion: plain.report_conclusion,
            processes,
            audit_findings,
        }
        return res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}