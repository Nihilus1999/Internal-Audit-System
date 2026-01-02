import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditTest = sequelize.define('audit_test', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    slug: {
        type: DataTypes.STRING(130),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    objective: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    scope: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    procedure: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    evaluation_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    estimated_hours: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    conclusion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: 'Por iniciar',
    },
    id_audit_program: {
        type: DataTypes.UUID,
        allowNull: false,
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