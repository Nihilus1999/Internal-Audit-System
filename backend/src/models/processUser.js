import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const ProcessUser = sequelize.define('process_responsible', {
    id_process: {
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
})