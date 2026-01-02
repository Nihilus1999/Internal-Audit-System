import { months, statusOptions } from "@/utils/HelpersLib";

class Process {
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
    const status = statusOptions.find(option => option.value === this.status);
    return status.label;
  }
}

export default Process;