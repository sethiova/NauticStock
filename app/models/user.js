const Model = require("./Model");
const bcrypt = require("bcryptjs");

class User extends Model {
  constructor() {
    super();
    this.fillable = [
      "name",
      "password",
      "account",
      "email",
      "ranks",
      "status",
      "roleId",
    ];
  }

  async registerUser(data) {
    const filteredData = {};

    this.fillable.forEach((field) => {
      if (field in data) {
        if (field === "password") {
          filteredData[field] = bcrypt.hashSync(data[field], 10);
        } else {
          filteredData[field] = data[field];
        }
      }
    });

    return await this.insert(filteredData);
  }
  async updateUser(id, data) {
    this.wheres = "id = ?";
    this.values = [id];
    const result = await this.update(data);
    return result;
  }

  async deleteUser(id) {
    this.wheres = "id = ?";
    this.values = [id];
    const result = await this.delete();
    return result;
  }
}

module.exports = User;
