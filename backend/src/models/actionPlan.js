import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const ActionPlan = sequelize.define('action_plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    slug: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    plan_type: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: 'Pendiente',
    },
    id_event: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    id_finding: {
        type: DataTypes.UUID,
        allowNull: true,
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