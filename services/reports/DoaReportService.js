const BaseReportService = require('../BaseReportService');

class DoaReportService extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'DOA Report';
    this.templatePath = 'views/doa.ejs';
    this.description = 'Delegation of Authority Report';
  }

  async fetchData(params) {
    const { id } = params;
    const connection = await this.getConnection();

    try {
      // Get user info
      const userResult = await connection.execute(
        `SELECT NAME, EMAIL, TO_CHAR(JOIN_DATE, 'YYYY-MM-DD') FROM USERS WHERE ID = :id`,
        [id]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = {
        name: userResult.rows[0][0],
        email: userResult.rows[0][1],
        join_date: userResult.rows[0][2],
      };

      // Get item list
      const itemResult = await connection.execute(
        `SELECT ITEMS_CODE, ITEMS_NAME, ITEMS_QTY, ITEMS_PRICE FROM MST_ITEMS`,
        [],
        { outFormat: connection.OBJECT }
      );
      
      const items = itemResult.rows;

      return {
        ...user,
        items
      };
    } finally {
      await connection.close();
    }
  }
}

module.exports = DoaReportService; 