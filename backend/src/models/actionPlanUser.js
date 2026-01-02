import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const ActionPlanUser = sequelize.define('plan_responsible', {
    id_action_plan: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
})