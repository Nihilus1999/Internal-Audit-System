import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditUser = sequelize.define('audit_participant', {
    id_audit_program: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    planning_requirements_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
    test_execution_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
    document_evidence_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
    document_findings_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
    report_preparation_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
    report_revision_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
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