import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditTestControl = sequelize.define('audit_test_control', {
    id_audit_test: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_audit_program: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_process: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_control: {
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