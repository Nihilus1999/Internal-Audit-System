import { months, criticalityOptions, statusEventsOptions } from "@/utils/HelpersLib";

class Event {
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

  get _incident_date() {
    const date = new Date(this.incident_date);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
  }

    get _incident_picker_date() {
    const date = new Date(this.incident_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  get _criticalityOptions() {
    const criticality = criticalityOptions.find(option => option.value === this.criticality);
    return criticality.label;
  }

  get _statusEventsOptions() {
    const statusEvents = statusEventsOptions.find(option => option.value === this.status);
    return statusEvents.label;
  }
}

export default Event;