const BaseReportService = require('../BaseReportService');

class ExampleReportService extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'Example Report';
    this.templatePath = 'views/example.ejs';
    this.description = 'Example report demonstrating the system capabilities';
  }

  async fetchData(params) {
    // This is an example that doesn't require database connection
    // In real reports, you would fetch data from your database
    
    const mockData = [
      { id: 1, name: 'Item 1', value: 100, category: 'A' },
      { id: 2, name: 'Item 2', value: 200, category: 'B' },
      { id: 3, name: 'Item 3', value: 150, category: 'A' },
      { id: 4, name: 'Item 4', value: 300, category: 'C' },
      { id: 5, name: 'Item 5', value: 250, category: 'B' }
    ];

    const totalValue = mockData.reduce((sum, item) => sum + item.value, 0);
    const categoryCount = mockData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      title: 'Example Report',
      subtitle: 'Demonstrating the report system',
      data: mockData,
      summary: {
        totalItems: mockData.length,
        totalValue: totalValue,
        categoryCount: categoryCount,
        date: new Date().toISOString(),
        generatedBy: 'Example Report Service'
      },
      filters: params // Show what parameters were passed
    };
  }
}

module.exports = ExampleReportService; 