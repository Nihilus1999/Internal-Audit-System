import moment from 'moment'
const calculateFiscalYear = (fiscalStartMonth, auditedDate) => {
    const date = moment(auditedDate)
    const fiscalStart = moment(date).month(fiscalStartMonth).date(1)
    return date.isBefore(fiscalStart) ? date.year() - 1 : date.year()
}
export const getFiscalYear = (fiscal_year_month, startDate, endDate) => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const fiscalStartMonthIndex = monthNames.findIndex(m => m.toLowerCase() === fiscal_year_month.toLowerCase())
    if (fiscalStartMonthIndex === -1) throw new Error('Mes de inicio del año fiscal inválido')
    const fyStart = calculateFiscalYear(fiscalStartMonthIndex, startDate)
    const fyEnd = calculateFiscalYear(fiscalStartMonthIndex, endDate)
    if (fyStart !== fyEnd) throw new Error('El período auditado abarca más de un año fiscal')
    return fyStart
}