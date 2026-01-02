import { DataTypes } from 'sequelize'
import { sequelize } from '../database/database.js'

export const PasswordReset = sequelize.define('password_reset', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_user: { 
        type: DataTypes.UUID, 
        allowNull: false,
    },
    otp_code: { 
        type: DataTypes.STRING(6), 
        allowNull: false 
    },
    expires_at: { 
        type: DataTypes.DATE, 
        allowNull: false },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})