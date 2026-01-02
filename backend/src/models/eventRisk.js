import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const EventRisk = sequelize.define('event_risk', {
    id_event: {
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