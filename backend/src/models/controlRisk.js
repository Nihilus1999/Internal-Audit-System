import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const ControlRisk = sequelize.define('control_risk', {
    id_control: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_risk: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
})