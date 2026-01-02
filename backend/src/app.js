import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import jsonErrorHandler from './helpers/handleJsonError.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/user.js'
import rolesRouter from './routes/role.js'
import permissionsRouter from './routes/permission.js'
import homeRouter from './routes/home.js'
import companyRouter from './routes/company.js'
import processesRouter from './routes/process.js'
import risksRouter from './routes/risk.js'
import eventsRouter from './routes/event.js'
import controlsRouter from './routes/control.js'
import actionPlansRouter from './routes/actionPlan.js'
import auditProgramsRouter from './routes/auditProgram.js'
import auditFindingsRouter from './routes/auditFinding.js'
import reportsRouter from './routes/reports.js'

//import swaggerDocs  from './swagger.js'

const app = express()

//CONFIG
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cors())
app.use(express.json())
app.use(jsonErrorHandler)
//swaggerDocs(app, process.env.PORT || 3000)

//ROUTES ENDPOINTS
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/roles', rolesRouter)
app.use('/permissions', permissionsRouter)
app.use('/home', homeRouter)
app.use('/company', companyRouter)
app.use('/processes', processesRouter)
app.use('/risks', risksRouter)
app.use('/events', eventsRouter)
app.use('/controls', controlsRouter)
app.use('/actionPlans', actionPlansRouter)
app.use('/auditPrograms', auditProgramsRouter)
app.use('/auditFindings', auditFindingsRouter)
app.use('/reports', reportsRouter)

export default app
