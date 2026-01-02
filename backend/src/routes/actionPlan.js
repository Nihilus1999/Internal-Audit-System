import { Router } from 'express'
import { getActionPlans, getActionPlanById, createActionPlan, updateActionPlanById, getPlanTasks, createPlanTask, updatePlanTaskById, deletePlanTaskById } from '../controllers/actionPlan.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { validateActionPlan } from '../validators/actionPlan.js'
import { validateTask } from '../validators/task.js'

const router = Router()

router.get('/', checkRoleAuth("get.action_plan"), getActionPlans)
router.post('/', checkRoleAuth("create.action_plan"), validateActionPlan, createActionPlan)
router
    .route("/:id")
    .get(checkRoleAuth('get.action_plan'), getActionPlanById)
    .put(checkRoleAuth('update.action_plan'), validateActionPlan, updateActionPlanById)
router
    .route("/tasks/:id") //Id del plan de acción
    .get(checkRoleAuth("get.action_plan"), getPlanTasks)
    .post(checkRoleAuth("update.action_plan"), validateTask, createPlanTask)
//Id del task
router.put('/tasks/update/:id', checkRoleAuth("update.action_plan"), validateTask, updatePlanTaskById)
router.delete('/tasks/delete/:id', checkRoleAuth("update.action_plan"), deletePlanTaskById)

export default router