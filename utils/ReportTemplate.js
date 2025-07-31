const BaseReportService = require('../services/BaseReportService');

/**
 * Template class for creating new reports
 * Copy this template and modify it for your specific report
 */
class ReportTemplate extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'Your Report Name';
    this.templatePath = 'views/your-template.ejs';
    this.description = 'Description of your report';
  }

  /**
   * Implement this method to fetch data for your report
   * @param {Object} params - Parameters passed from the request
   * @returns {Object} Data object that will be passed to the EJS template
   */
  async fetchData(params) {
    const connection = await this.getConnection();
    
    try {
      // Example: Fetch data from database
      // const result = await connection.execute(
      //   `SELECT * FROM your_table WHERE condition = :param`,
      //   [params.param]
      // );
      
      // Example: Return structured data
      return {
        // title: 'Your Report Title',
        // data: result.rows,
        // summary: {
        //   total: result.rows.length,
        //   date: new Date().toISOString()
        // }
      };
    } finally {
      await connection.close();
    }
  }

  /**
   * Optional: Override this method if you need custom PDF options
   */
  async generateReport(params, pdfOptions = {}) {
    // You can customize PDF options here
    const customPdfOptions = {
      ...pdfOptions,
      // format: 'A4',
      // margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    };
    
    return await super.generateReport(params, customPdfOptions);
  }
}

module.exports = ReportTemplate; 