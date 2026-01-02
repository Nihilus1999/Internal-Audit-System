import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const Risk = sequelize.define('risk', {
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
    risk_source: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    origin: {
        type: DataTypes.CHAR(7),
        allowNull: false,
    },
    possible_consequences: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    probability: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    impact: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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