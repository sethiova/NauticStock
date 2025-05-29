const mysql = require("mysql2/promise");
const { db: dbConfig } = require("../config/config");

class DB {
  constructor(table) {
    this.table = table;
    this.selectFields = "*";
    this.joins = "";
    this.wheres = "1=1";
    this.order = "";
    this.group = "";
    this.limitVal = "";
    this.values = [];
    this.connection = null; // 👈 AGREGAR PROPIEDAD
  }

  async connect() {
    try {
      if (!this.connection) {
        console.log('🔌 Connecting to database...');
        this.connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');
      }
      return this.connection;
    } catch (err) {
      console.error('❌ Database connection failed:', err);
      throw err;
    }
  }

  // 👇 MÉTODO MEJORADO: executeQuery -> execute (compatible con History.js)
  async execute(sql, params = []) {
    try {
      console.log('📊 Executing query:', sql);
      if (params.length > 0) {
        console.log('📊 With parameters:', params);
      }

      const conn = await this.connect();
      const [result] = await conn.execute(sql, params);
      
      console.log('✅ Query executed successfully, rows:', result.length || result.affectedRows || 0);
      return result;
      
    } catch (error) {
      console.error("❌ Error en execute:", error);
      console.error("❌ Query was:", sql);
      console.error("❌ Parameters were:", params);
      
      // 👇 NUEVO: Intentar reconectar si es error de conexión
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
        console.log('🔄 Connection lost, attempting to reconnect...');
        this.connection = null; // Reset connection
        const conn = await this.connect();
        const [result] = await conn.execute(sql, params);
        return result;
      }
      
      throw error;
    }
  }

  // 👇 ALIAS PARA COMPATIBILIDAD (puedes usar ambos nombres)
  async executeQuery(sql, params = []) {
    return this.execute(sql, params);
  }

  select(fields = ["*"]) {
    this.selectFields = fields.join(", ");
    return this;
  }

  join(joinTable, onCondition, type = "INNER") {
    this.joins += ` ${type} JOIN ${joinTable} ON ${onCondition}`;
    return this;
  }

  where(conditions = []) {
    const clauses = conditions.map(([field, value, operator = "="]) => {
      if (operator.toUpperCase() === "IS" && value === null)
        return `${field} IS NULL`;
      if (operator.toUpperCase() === "IS" && value === "NOT NULL")
        return `${field} IS NOT NULL`;
      return `${field} ${operator} ?`;
    });
    this.wheres = clauses.join(" AND ");
    this.values = conditions
      .map((cond) => cond[1])
      .filter((v) => v !== "NOT NULL");
    return this;
  }

  orderBy(fields = []) {
    this.order = `ORDER BY ${fields
      .map(([field, dir]) => `${field} ${dir}`)
      .join(", ")}`;
    return this;
  }

  groupBy(fields = []) {
    this.group = `GROUP BY ${fields.join(", ")}`;
    return this;
  }

  limit(n) {
    this.limitVal = `LIMIT ${n}`;
    return this;
  }
  
  reset() {
    this.selectFields = '*';
    this.joins = '';
    this.wheres = '1=1';
    this.order = '';
    this.group = '';
    this.limitVal = '';
    this.values = [];
  }
  
  async get() {
    try {
      const sql = `SELECT ${this.selectFields} FROM ${this.table} ${this.joins} WHERE ${this.wheres} ${this.group} ${this.order} ${this.limitVal}`;
      const conn = await this.connect();
      const [rows] = await conn.execute(sql, this.values);
      return rows;
    } catch (error) {
      console.error("Error en DB.get():", error);
      throw error;
    } finally {
      this.reset();
    }
  }

  async insert(data) {
    try {
      const fields = Object.keys(data).join(", ");
      const placeholders = Object.keys(data)
        .map(() => "?")
        .join(", ");
      const values = Object.values(data);
      const sql = `INSERT INTO ${this.table} (${fields}) VALUES (${placeholders})`;
      
      console.log('📝 Inserting into:', this.table);
      const conn = await this.connect();
      const [result] = await conn.execute(sql, values);
      
      console.log('✅ Insert successful, ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("❌ Error en insert:", error);
      throw error;
    }
  }

  async update(data) {
    try {
      const fields = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);
      const sql = `UPDATE ${this.table} SET ${fields} WHERE ${this.wheres}`;
      
      const conn = await this.connect();
      const [result] = await conn.execute(sql, [...values, ...this.values]);
      this.reset();
      
      console.log('✅ Update successful, affected rows:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error("❌ Error en update:", error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = `DELETE FROM ${this.table} WHERE ${this.wheres}`;
      const conn = await this.connect();
      const [result] = await conn.execute(sql, this.values);
      this.reset();
      
      console.log('🗑️ Delete successful, affected rows:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error("❌ Error en delete:", error);
      throw error;
    }
  }

  // 👇 NUEVO: Método para cerrar conexión
  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Database connection closed');
    }
  }
}

module.exports = DB;