import {
  months,
  statusOptions,
  inherentOptions,
  residualOptions,
} from "@/utils/HelpersLib";

class Risk {
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

  get _inherentOptions() {
    const inherent = inherentOptions.find(
      (option) => option.value === this.inherentRisk
    );
    return inherent.label;
  }

  get _residualOptions() {
    const residual = residualOptions.find(
      (option) => option.value === this.residualRisk
    );
    return residual.label;
  }
  
}

export default Risk;
