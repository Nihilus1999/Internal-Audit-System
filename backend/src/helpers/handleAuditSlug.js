import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { AuditFinding } from '../models/auditFinding.js'
export const generateAuditSlug = async (name, fiscalYear, type) => {
    const slug = `${name.trim().replace(/\s+/g, '-').toLowerCase()}-FY${fiscalYear}`
    let exists
    if (type == 'Program') {
        exists = await AuditProgram.unscoped().findOne({ where: { slug }, paranoid: false })
        if (exists) throw new Error(`No pueden existir programas de auditoría con la misma combinación de nombre y año fiscal: "${slug}"`)
    } else if (type == 'Test') {
        exists = await AuditTest.unscoped().findOne({ where: { slug }, paranoid: false })
        if (exists) throw new Error(`No pueden existir pruebas de auditoría con la misma combinación de título y año fiscal: "${slug}"`)
    } else {
        exists = await AuditFinding.unscoped().findOne({ where: { slug }, paranoid: false })
        if (exists) throw new Error(`No pueden existir hallazgos con la misma combinación de título y año fiscal: "${slug}"`)
    }
    return slug
}