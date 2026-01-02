import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const File = sequelize.define('file', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    extension: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    content: {
        type: DataTypes.BLOB('long'), // Usar BLOB para datos binarios grandes
        allowNull: false,
    },
    test_file_type: {
        type: DataTypes.STRING(9),
        allowNull: true,
    },
    id_audit_test: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    id_event: {
        type: DataTypes.UUID,
        allowNull: true,
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