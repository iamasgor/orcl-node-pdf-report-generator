const BaseReportService = require('../BaseReportService');

class TestReportService extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'Test Report';
    this.templatePath = 'views/doa.ejs';
    this.description = 'Test Report for development purposes';
  }

  async fetchData(params) {
    // For test report, we use mock data
    return {
      name: "Asgor",
      email: "test@example.com",
      join_date: "2024-01-01",
      items: []
    };
  }
}

module.exports = TestReportService; 