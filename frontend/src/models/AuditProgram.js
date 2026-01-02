import { months, statusOptions } from "@/utils/HelpersLib";
import { statusPhasesOptions } from "@/utils/HelpersLib";

class AuditProgram {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static getStatusColor(value) {
    const status = statusPhasesOptions.find(opt => opt.value === value);
    return status ? status.color : "#000000";
  }

  get _planning_status_color() {
    return AuditProgram.getStatusColor(this.planning_status);
  }

  get _execution_status_color() {
    return AuditProgram.getStatusColor(this.execution_status);
  }

  get _reporting_status_color() {
    return AuditProgram.getStatusColor(this.reporting_status);
  }

  get _created_at() {
    const date = new Date(this.created_at);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
  }

  get _updated_at() {
    const date = new Date(this.updated_at);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
  }

  get _status() {
    const status = statusOptions.find((option) => option.value === this.status);
    return status.label;
  }

  get _start_date() {
    const date = new Date(this.start_date);
    return date.toLocaleDateString("es-VE");
  }

  get _end_date() {
    const date = new Date(this.end_date);
    return date.toLocaleDateString("es-VE");
  }

  get _audit_start_date() {
    const date = new Date(this.audited_period_start_date);
    return date.toLocaleDateString("es-VE");
  }

  get _audit_end_date() {
    const date = new Date(this.audited_period_end_date);
    return date.toLocaleDateString("es-VE");
  }

  get _start_picker_date() {
    const date = new Date(this.start_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  get _end_picker_date() {
    const date = new Date(this.end_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export default AuditProgram;
