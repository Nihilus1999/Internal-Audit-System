import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditTestUser = sequelize.define('audit_test_participant', {
    id_audit_test: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_audit_program: {
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