import { months, statusOptions } from "@/utils/HelpersLib";

class ActionPlan {
  constructor(data = {}) {
    Object.assign(this, data);
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
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
  }

  get _end_date() {
    const date = new Date(this.end_date);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
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

export default ActionPlan;
