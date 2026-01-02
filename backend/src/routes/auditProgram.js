import { Router } from 'express'
import { getAuditPrograms, getAuditFiscalYears, getAuditProgramById, createAuditProgram, updateDetailsAuditProgramById, suspendAuditProgramById, activeAuditProgramById, updatePlanningProcesses, updatePlanningControls, updatePlanningUsers, auditPlanningHeatMap, getPlanningUser, updatePlanningUser, updatePlanningStatus, updateExecutionStatus, updateReportStatus, updateResultsReport, getKpiReportDashboard, getPieChartReportDashboard, getBarChartFindingsReportDashboard, getBarChartControlsReportDashboard } from '../controllers/auditProgram.js'
import { getPlanningAuditTests, createTest, getPlanningAuditTestById, updatePlanningTestById, getTestFiles, uploadTestFiles, downloadTestFile, deleteTestFile, getExecutionAuditTests, getExecutionAuditTestById, updateConclusionsAuditTestById } from '../controllers/auditTest.js'
import { getAuditTestFindings, createAuditFinding, getAuditFindingById, updateAuditFinding } from '../controllers/auditFinding.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { checkAuditStatus } from '../middlewares/checkAuditStatus.js'
import { upload } from '../middlewares/uploadFiles.js'
import { validateAuditProgram, validatePlanningProcesses, validatePlanningControls, validatePlanningUsers, validatePlanningHours, validateAuditStatus, validateResultsReport } from '../validators/auditProgram.js'
import { validatePlanningAuditTest, validateConclusionsAuditTest } from '../validators/auditTest.js'
import { validateAuditFinding } from '../validators/auditFinding.js'

const router = Router()

router.get('/', checkRoleAuth("get.audit_program"),  getAuditPrograms)
router.get('/fiscalyears', checkRoleAuth("get.audit_program"),  getAuditFiscalYears)
router.post('/', checkRoleAuth("create.audit_program"), validateAuditProgram, createAuditProgram)
router
    .route("/:id")
    .get(checkRoleAuth('get.audit_program'), checkAuditStatus, getAuditProgramById)
    .put(checkRoleAuth('update.audit_program'), checkAuditStatus, validateAuditProgram, updateDetailsAuditProgramById)
router.put('/suspend/:id', checkRoleAuth('update.status.audit_program'), checkAuditStatus, suspendAuditProgramById)
router.put('/activate/:id', checkRoleAuth('update.status.audit_program'), checkAuditStatus, activeAuditProgramById)
// FASE DE PLANIFICACIÓN
router.put('/planning/:id', checkRoleAuth('update.status.audit_program'), checkAuditStatus, validateAuditStatus, updatePlanningStatus)
router.put('/planning/processes/:id', checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningProcesses, updatePlanningProcesses)
router.put('/planning/controls/:id', checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningControls, updatePlanningControls)
router.put('/planning/users/:id', checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningUsers, updatePlanningUsers)
router.get('/planning/heatMap/:id', checkRoleAuth('update.planning.audit_program'), checkAuditStatus, auditPlanningHeatMap)
router
    .route("/planning/:id/user/:userId")
    .get(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, getPlanningUser)
    .put(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningHours, updatePlanningUser)
router
    .route("/planning/tests/:id") //Id del programa de auditoría
    .get(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, getPlanningAuditTests)
    .post(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningAuditTest, createTest)
//Id de la prueba
router.get("/planning/tests/get/:id", checkRoleAuth('update.planning.audit_program'), checkAuditStatus, getPlanningAuditTestById)
router.put("/planning/tests/update/:id", checkRoleAuth('update.planning.audit_program'), checkAuditStatus, validatePlanningAuditTest, updatePlanningTestById)
router
    .route("/planning/tests/files/source/:id") //Id de a prueba
    .get(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, getTestFiles('Fuente'))
    .post(checkRoleAuth('update.planning.audit_program'), checkAuditStatus, upload.array('files'), uploadTestFiles('Fuente'))
//Id del file
router.get("/planning/tests/files/source/download/:id", checkRoleAuth('update.planning.audit_program'), checkAuditStatus, downloadTestFile)
router.delete("/planning/tests/files/source/delete/:id", checkRoleAuth('update.planning.audit_program'), checkAuditStatus, deleteTestFile)
// FASE DE EJECUCIÓN
router.put('/execution/:id', checkRoleAuth('update.status.audit_program'), checkAuditStatus, validateAuditStatus, updateExecutionStatus)
router.get("/execution/tests/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getExecutionAuditTests) //Id del programa de auditoría
router.get("/execution/tests/files/source/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getTestFiles('Fuente'))  //Id de la prueba de auditoría
router.get("/execution/tests/files/source/download/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, downloadTestFile) //Id del documento
router
    .route("/execution/tests/files/evidence/:id") //Id de la prueba de auditoría
    .get(checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getTestFiles('Evidencia')) 
    .post(checkRoleAuth('update.execution.audit_program'), checkAuditStatus, upload.array('files'), uploadTestFiles('Evidencia'))
router.get("/execution/tests/files/evidence/download/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, downloadTestFile)
router.delete("/execution/tests/files/evidence/delete/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, deleteTestFile)
//Id de la prueba
router.get("/execution/tests/get/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getExecutionAuditTestById)
router.put("/execution/tests/update/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, validateConclusionsAuditTest, updateConclusionsAuditTestById)
router
    .route("/execution/tests/findings/:id") //Id de la prueba de auditoría
    .get(checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getAuditTestFindings)
    .post(checkRoleAuth('update.execution.audit_program'), checkAuditStatus, validateAuditFinding, createAuditFinding)
//Id del hallazgo
router.get("/execution/tests/findings/get/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, getAuditFindingById)
router.put("/execution/tests/findings/update/:id", checkRoleAuth('update.execution.audit_program'), checkAuditStatus, validateAuditFinding, updateAuditFinding)
// FASE DE REPORTE
router.put("/report/:id", checkRoleAuth('update.status.audit_program'), checkAuditStatus, validateAuditStatus, updateReportStatus)
router.put("/report/results/:id", checkRoleAuth('update.report.audit_program'), checkAuditStatus, validateResultsReport, updateResultsReport)
router.get("/report/dashboard/kpi/:id", checkRoleAuth('update.report.audit_program'), checkAuditStatus, getKpiReportDashboard)
router.get("/report/dashboard/pieChart/:id", checkRoleAuth('update.report.audit_program'), checkAuditStatus, getPieChartReportDashboard)
router.get("/report/dashboard/barChart/findings/:id", checkRoleAuth('update.report.audit_program'), checkAuditStatus, getBarChartFindingsReportDashboard)
router.get("/report/dashboard/barChart/controls/:id", checkRoleAuth('update.report.audit_program'), checkAuditStatus, getBarChartControlsReportDashboard)

export default router