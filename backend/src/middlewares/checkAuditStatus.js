import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { AuditFinding } from '../models/auditFinding.js'
import { File } from '../models/file.js'
import { serverError } from '../helpers/handleServerError.js'
import { validate as validateUUID } from 'uuid'
export const checkAuditStatus = async (req, res, next) => {
    try {
        const id  = req.params.id
        if(!id) return res.status(400).json({ message: ['Id no proporcionado'] })
        let condition = validateUUID(id) ? { id } : { slug: id }
        if ((req.originalUrl.includes('findings/get')) || (req.originalUrl.includes('findings/update'))) {
            const auditFinding = await AuditFinding.unscoped().findOne({ where: condition }) // Verifica el id del hallazgo
            if (!auditFinding) return res.status(404).json({ message: ['El hallazgo no fue encontrado'] })
            const auditTest = await AuditTest.unscoped().findByPk(auditFinding.id_audit_test) 
            if (!auditTest) return res.status(404).json({ message: ['La prueba de auditoria asociada al hallazgo no fue encontrada'] })
            condition = { id: auditTest.id_audit_program }
        } else if (req.originalUrl.includes('/download') || req.originalUrl.includes('/delete')) {
            const file = await File.findByPk(id)
            if (!file) return res.status(404).json({ message: ['Documento no encontrado'] })
            if (!file.id_audit_test) return res.status(403).json({ message: ['Este documento no pertenece a una prueba de auditoría'] })
            if(req.originalUrl.includes('/source') && file.test_file_type != 'Fuente') return res.status(422).json({ message: ['El documento de la prueba no es una fuente de información'] })
            if(req.originalUrl.includes('/evidence') && file.test_file_type != 'Evidencia') return res.status(422).json({ message: ['El documento de la prueba no es una evidencia'] })
            const auditTest = await AuditTest.unscoped().findByPk(file.id_audit_test)  // Verifica el id de la prueba
            if (!auditTest) return res.status(404).json({ message: ['La prueba de auditoría asociada al documento no fue encontrada'] })
            if (auditTest.status == 'Suspendido' && req.originalUrl.includes('/execution')) return res.status(423).json({ message: ['La prueba de auditoría ha sido suspendida, por lo tanto no se puede llevar a cabo la etapa de ejecución de esta prueba']})
            condition = { id: auditTest.id_audit_program }
        } else if (req.originalUrl.includes('/tests/get') || req.originalUrl.includes('/tests/update') || req.originalUrl.includes('/tests/files') || req.originalUrl.includes('/tests/findings')) {
            const auditTest = await AuditTest.unscoped().findOne({ where: condition }) // Verifica el id de la prueba
            if (!auditTest) return res.status(404).json({ message: ['La prueba de auditoría no fue encontrada'] })
            if (auditTest.status == 'Suspendido' && req.originalUrl.includes('/execution')) return res.status(423).json({ message: ['La prueba de auditoría ha sido suspendida, por lo tanto no se puede llevar a cabo la etapa de ejecución de esta prueba']})
            condition = { id: auditTest.id_audit_program }
        }
        const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
        if (!auditProgram) {
            return res.status(404).json({ message: ['El programa de auditoría no fue encontrado'] })
        }
        if(auditProgram.status == 'Suspendido' && (req.originalUrl.includes('/planning') || req.originalUrl.includes('/execution') || req.originalUrl.includes('/report'))){
            return res.status(409).json({ message: ['El programa de auditoría ha sido suspendido, por lo tanto no se puede llevar a cabo las etapas de planificación, ejecución ni reporte'] })
        }
        if(req.originalUrl.includes('/execution') && auditProgram.planning_status != 'Completado'){
            return res.status(412).json({ message: ['No se puede avanzar a la fase de ejecución sino se ha completado la fase de planificación'] })
        }
        if(req.originalUrl.includes('/report') && auditProgram.execution_status != 'Completado'){
            return res.status(412).json({ message: ['No se puede avanzar a la fase de reporte sino se ha completado la fase de ejecución'] })
        }
        next()
    } catch (error) {
        serverError(res, error)
    }
}