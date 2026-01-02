import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const Event = sequelize.define('event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    slug: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    cause: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    consequences: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    criticality: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    incident_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    incident_hour: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    economic_loss: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(13),
        allowNull: false,
        defaultValue: 'Reportado',
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