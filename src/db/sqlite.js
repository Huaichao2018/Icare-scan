// 创建 DB 对象，包含所有方法和属性
const DB = {
  /** 
   * @type {String} 数据库名称
   */
  dbName: 'report',
  /**
   * 数据库地址
   * @type {String} 推荐以下划线为开头   _doc/xxx.db
   * @description 开发环境中数据库所在地址：文件管理/Android/data/io.dcloud.HBuilder/downloads/report.db
   * @description 打包安装后数据库所在地址：文件管理/Android/data/uni.UNI4312312(以UNI开头接数字)/downloads/report.db
   */
  dbPath: '_downloads/report.db',
  /**
   * 加班记录表名
   * @description
   * "time" DATE  PRIMARY KEY,"money" INTEGER,"notes" text,"info" text
   */
  recordsTable: 'records',

  /**
   * 判断数据库是否打开
   * @returns {Boolean} 打开为 true，未打开为 false
   */
  isOpen() {
    var open = plus.sqlite.isOpenDatabase({
      name: this.dbName,
      path: this.dbPath
    })
    return open;
  },

  async initTable() {
    if (!this.isOpen()) {
      await this.openSqlite()
    }
    const tables = await this.selectTableData('sqlite_master', "")
    /**
     * 报告识别记录
     * Id 主键Id=报告识别时间=数据创建时间
     * spName 患者姓名
     * spAge 患者年龄
     * spSex 患者性别
     * departments 科室
     * reportName 报告名称
     * reportTime 报告时间
     * reportRes	报告识别结果集
     * img 识别的原始图片
     */
    if (!tables.find(item => item.tbl_name == 'discern_record')) {
      await this.createTable('discern_record', `
      Id nvarchar(200),
      spName varchar(200),
      spAge int,
      spSex varchar(100),
      departments nvarchar(2000),
      reportName nvarchar(200),
      reportTime nvarchar(200),
      reportRes text,
      img BLOB
      `)
    }
    /**
     * 报告记录
     * Id 主键Id=数据创建时间
     * discernId 报告识别Id=报告识别结果集=识别数据创建时间
     * spName 患者姓名
     * spAge 患者年龄
     * spSex 患者性别
     * departments 科室
     * reportName 报告名称
     * reportTime 报告时间
     * reportRes	报告结果集
     * img 识别的原始图片 
     */
    if (!tables.find(item => item.tbl_name == 'report_record')) {
      await this.createTable('report_record', `
      Id nvarchar(200),
      discernId nvarchar(200),
      spName varchar(200),
      spAge int,
      spSex varchar(100),
      departments nvarchar(2000),
      reportName nvarchar(200),
      reportTime nvarchar(200),
      reportRes text,
      img BLOB
      `)
    }
    if (!tables.find(item => item.tbl_name == 'report_record_new')) {
      await this.createTable('report_record_new', `
        id nvarchar(200),
        billNo nvarchar(20),
        imageCount nvarchar(50),
        remark text,
        createTime DATETIME,
        status nvarchar(50)
        `)
    }
    if (!tables.find(item => item.tbl_name == 'report_record_img')) {
      await this.createTable('report_record_img', `
        id nvarchar(200),
        info_id nvarchar(200),
        img_billNo nvarchar(200),
        img_name text,
        img text,
        reportRes text
        `)
    }
    if (!tables.find(item => item.tbl_name == 'report_inspection_items')) {
      await this.createTable('report_inspection_items', `
        id nvarchar(200),
        inspection_name nvarchar(200),
        abbreviation nvarchar(200)
        `)
    }
  },

  /**,*
   * 打开数据库，没有则创建
   */
  openSqlite() {
    return new Promise((resolve, reject) => {
      plus.sqlite.openDatabase({
        name: this.dbName,
        path: this.dbPath,
        success(e) {
          resolve(e);
        },
        fail(e) {
          reject(e);
        }
      })
    })
  },

  /**
   * 关闭数据库
   */
  closeSqlite() {
    return new Promise((resolve, reject) => {
      plus.sqlite.closeDatabase({
        name: this.dbName,
        success(e) {
          resolve(e);
        },
        fail(e) {
          reject(e);
        }
      })
    })
  },

  /**
   * 数据库建表 sql:'CREATE TABLE IF NOT EXISTS dbTable("id" varchar(50),"name" TEXT) 
   * 创建 CREATE TABLE IF NOT EXISTS 、 dbTable 是表名，不能用数字开头、括号里是表格的表头
   * @param {Object} dbTable 表名
   * @param {Object} data 表列
   * @example 创建表 DB.createTable(表名, 表的列)
   * let sql = '"date" DATE  PRIMARY KEY,"money" INTEGER,"notes" text,"info" text';
   * await DB.createTable('records', sql);
   */
  createTable(dbTable, data) {
    return new Promise((resolve, reject) => {
      // executeSql: 执行增删改等操作的SQL语句
      plus.sqlite.executeSql({
        name: this.dbName,
        sql: `CREATE TABLE IF NOT EXISTS ${dbTable}(${data})`,
        success(e) {
          console.log('chengg', e)
          resolve(e);
        },
        fail(e) {
          console.log('失败', e)
          reject(e);
        }
      })
    })
  },

  /**
   * 数据库删表
   * @param {Object} dbTable 表名
   * @description 数据库删表 sql:'DROP TABLE dbTable'
   */
  dropTable(dbTable) {
    return new Promise((resolve, reject) => {
      plus.sqlite.executeSql({
        name: this.dbName,
        sql: `DROP TABLE ${dbTable}`,
        success(e) {
          resolve(e);
        },
        fail(e) {
          reject(e);
        }
      })
    })
  },
  deleteTable(dbTable, WHERE = '') {
    return new Promise((resolve, reject) => {
      plus.sqlite.executeSql({
        name: this.dbName,
        sql: `DELETE FROM ${dbTable} ${WHERE}`,
        success(e) {
          console.log('success', 'deleteTable')
          resolve(e);
        },
        fail(e) {
          console.log('err', e)
          reject(e);
        }
      })
    })
  },
  bathInsertData(table, column, data) {
    console.log(111, table)
    return new Promise((resolve, reject) => {
      plus.sqlite.executeSql({
        name: this.dbName,
        sql: `INSERT INTO ${table} ${column} VALUES ${data}`,
        success(e) {
          console.log('success1', e)
          resolve({
            code: 200
          });
        },
        fail(e) {
          console.log('err', e)
          resolve({
            code: 500
          });
        }
      })
    })
  },

  // 向表格里添加数据 sql:'INSERT INTO dbTable VALUES('x','x','x')'			对应新增
  // 或者 sql:'INSERT INTO dbTable ('x','x','x') VALUES('x','x','x')'	具体新增
  /**
   * 向表格里添加数据
   * @param {String} dbTable 表名
   * @param {String} data 列值
   * @param {String} condition 表头列名
   * @example  
   * let sql = `'${item.money}','${item.notes}','${item.time}'`;
   * let condition = "'money','notes','time'";
   * await DB.insertTableData("records", condition, sql);
   */
  insertTableData(dbTable, condition, data) {
    // 判断有没有传参
    if (dbTable !== undefined && data !== undefined) {
      // 判断传的参是否有值
      var bol = (JSON.stringify(data) == "{}");
      if (!bol) {
        var sql = `INSERT INTO ${dbTable} (${condition}) VALUES(${data})`;
        // console.log(sql);
        return new Promise((resolve, reject) => {
          // 表格添加数据
          plus.sqlite.executeSql({
            name: this.dbName,
            sql: sql,
            success(e) {
              console.log('suc', e)
              resolve({
                code: 200,
                data: e
              });
            },
            fail(e) {
              console.log('err', e)
              resolve({
                code: 500,
                data: e
              });
            }
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          reject("错误添加")
        })
      }
    } else {
      return new Promise((resolve, reject) => {
        reject("错误添加")
      })
    }
  },

  /**
   * 根据条件向表格里添加数据  有数据更新、无数据插入
   * (建表时需要设置主键) 例如 --- "roomid" varchar(50) PRIMARY KEY
   * @param {String} dbTable 表名
   * @param {String} data 列值
   * @param {String} condition 表头列名
   * @example  
   * let sql = `'${item.money}','${item.notes}','${item.time}'`;
   * let condition = "'money','notes','time'";
   * await DB.insertTableData("records", sql, condition);
   */
  insertOrReplaceData(dbTable, data, condition) {
    // 判断有没有传参
    if (dbTable !== undefined && data !== undefined) {
      if (condition == undefined) {
        var sql = `INSERT OR REPLACE INTO ${dbTable} VALUES('${data}')`;
      } else {
        var sql = `INSERT OR REPLACE INTO ${dbTable} (${condition}) VALUES(${data})`;
      }
      // console.log(sql);
      return new Promise((resolve, reject) => {
        // 表格添加数据
        plus.sqlite.executeSql({
          name: this.dbName,
          sql: sql,
          success(e) {
            resolve(e);
          },
          fail(e) {
            reject(e);
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        reject("错误添加")
      })
    }
  },

  /**
   * 查询获取数据库里的数据 sql:'SELECT * FROM dbTable WHERE lname = 'lvalue''
   * @param {String} dbTable 表名
   * @param {String} [condition = ''] 查找条件
   * @example
   * const searchCondition = `WHERE date = '${day}'`
   * await DB.selectTableData('表名', searchCondition);
   */
  selectTableData(dbTable, condition = '') {
    if (dbTable !== undefined) {
      var sql = `SELECT * FROM ${dbTable} ${condition}`;
      console.log(sql);
      return new Promise((resolve, reject) => {
        // 表格查询数据  执行查询的SQL语句
        plus.sqlite.selectSql({
          name: this.dbName,
          sql: sql,
          success(e) {
            console.log('suc', e)
            resolve(e);
          },
          fail(e) {
            console.log('err', e)
            reject(e);
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        reject("错误查询")
      });
    }
  },
  /**
   * 查询获取数据库里的数据 sql:'SELECT * FROM dbTable WHERE lname = 'lvalue''
   * @param {String} dbTable 表名
   * @param {String} [condition = ''] 查找条件
   * @example
   * const searchCondition = `WHERE date = '${day}'`
   * await DB.selectTableData('表名', searchCondition);
   */
  selectSql(name, sql) {
    if (name !== undefined) {
      return new Promise((resolve, reject) => {
        plus.sqlite.selectSql({
          name: name,
          sql: sql,
          success(e) {
            resolve(e);
          },
          fail(e) {
            reject(e);
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        reject("错误查询")
      });
    }
  },

  /**
   * 删除表里的数据 sql:'DELETE FROM dbTable WHERE lname = 'lvalue''
   * @param {String} dbTable 表名
   * @param {String} [condition = ''] 查找条件
   * @example
   * const searchCondition = `WHERE date = '${day}'`
   * await DB.deleteTableData('表名', searchCondition);
   */
  deleteTableData(dbTable, condition = '') {
    if (dbTable !== undefined) {
      var sql = `DELETE FROM ${dbTable} ${condition}`;
      return new Promise((resolve, reject) => {
        // 删除表数据
        plus.sqlite.executeSql({
          name: this.dbName,
          sql: sql,
          success(e) {
            resolve(e);
          },
          fail(e) {
            reject(e);
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        reject("错误删除")
      });
    }
  },

  // 修改数据表里的数据 sql:"UPDATE dbTable SET 列名 = '列值',列名 = '列值' WHERE lname = 'lvalue'"
  // 修改 UPDATE 、 dbTable 是表名, data: 要修改的列名=修改后列值, lname,lvalue 是查询条件的列名和列值
  updateTableData(dbTable, data, where = '') {
    var sql = `UPDATE ${dbTable} SET ${data} ${where}`;
    // WHERE 前面是要修改的列名、列值，后面是条件的列名、列值
    return new Promise((resolve, reject) => {
      // 修改表数据
      plus.sqlite.executeSql({
        name: this.dbName,
        sql: sql,
        success(e) {
          console.log('suc', e)
          resolve({
            code: 200
          });
        },
        fail(e) {
          console.log('err', e)
          resolve({
            code: 500
          });
        }
      })
    })
  },

  // 获取指定数据条数  sql:"SELECT * FROM dbTable ORDER BY 'id' DESC LIMIT 15 OFFSET 'num'"
  // dbTable 表名, ORDER BY 代表排序默认正序, id 是排序的条件 DESC 代表倒序，从最后一条数据开始拿
  // LIMIT 15 OFFSET '${num}',这句的意思是跳过 num 条拿 15 条数据, num 为跳过多少条数据是动态值
  // 例 初始num设为0，就从最后的数据开始拿15条，下次不拿刚获取的数据，所以可以让num为15，这样就能一步一步的拿完所有的数据
  pullSQL(dbTable, id, num) {
    return new Promise((resolve, reject) => {
      plus.sqlite.selectSql({
        name: this.dbName,
        sql: `SELECT * FROM ${dbTable} ORDER BY '${id}' DESC LIMIT 15 OFFSET '${num}'`,
        success(e) {
          resolve(e);
        },
        fail(e) {
          reject(e);
        }
      })
    })
  }
};

// 使用 ES6 默认导出
export default DB;