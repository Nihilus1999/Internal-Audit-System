import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditProgram = sequelize.define('audit_program', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    slug: {
        type: DataTypes.STRING(130),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    objectives: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    scope: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    evaluation_criteria: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fiscal_year: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    audited_period_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    audited_period_end_date: {
        type: DataTypes.DATE,
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
    report_title: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    report_introduction: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    report_audit_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    report_auditor_opinion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    report_conclusion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'Por iniciar',
    },
    planning_status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: 'Por iniciar',
    },
    execution_status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: 'Por iniciar',
    },
    reporting_status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: 'Por iniciar',
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