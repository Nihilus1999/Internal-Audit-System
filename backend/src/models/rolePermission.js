import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const RolePermission = sequelize.define('role_permission', {
    id_role: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_permission: {
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