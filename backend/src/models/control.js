import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const Control = sequelize.define('control', {
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
    control_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    management_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    teoric_effectiveness: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    application_frequency: {
        type: DataTypes.STRING(20),
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