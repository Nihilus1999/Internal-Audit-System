import { getRandomPastelColor, months, statusOptions } from "@/utils/HelpersLib";

class User {
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

  get _initials() {
    const nameInitial = this.first_name.charAt(0).toUpperCase();
    const lastnameInitial = this.last_name.charAt(0).toUpperCase();
    return `${nameInitial}${lastnameInitial}`;
  }

  get _avatar_background_color() {
    const key = `avatar_color`;
    let color = localStorage.getItem(key);

    if (!color) {
      color = getRandomPastelColor();
      localStorage.setItem(key, color);
    }
    return color;
  }

  get _fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  get _role() {
    return this.role.name;
  }

  get _permissions() {
    if (!this.role || !Array.isArray(this.role.permissions)) return [];
    return this.role.permissions
      .filter((permission) => permission.status)
      .map((permission) => permission.key);
  }


  get _status() {
    const status = statusOptions.find(option => option.value === this.status);
    return status.label;
  }
}

export default User;
