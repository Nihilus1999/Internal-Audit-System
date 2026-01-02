import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const AuditFinding = sequelize.define('audit_finding', {
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
    observations: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    classification: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    root_cause: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    possible_consequences: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    finding_type: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    recommendations: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    id_audit_test: {
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
    defaultScope: {
        where: { status: true },
    },
})
