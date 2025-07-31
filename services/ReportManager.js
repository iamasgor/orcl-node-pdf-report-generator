const express = require('express');
const DoaReportService = require('./reports/DoaReportService');
const TestReportService = require('./reports/TestReportService');

class ReportManager {
  constructor() {
    this.reports = new Map();
    this.router = express.Router();
    this.registerDefaultReports();
    this.setupRoutes();
  }

  /**
   * Register default reports
   */
  registerDefaultReports() {
    this.registerReport('doa', new DoaReportService());
    this.registerReport('test', new TestReportService());
  }

  /**
   * Register a new report service
   */
  registerReport(name, reportService) {
    this.reports.set(name, reportService);
    console.log(`Registered report: ${name} - ${reportService.reportName}`);
  }

  /**
   * Get a report service by name
   */
  getReport(name) {
    return this.reports.get(name);
  }

  /**
   * Get all registered reports
   */
  getAllReports() {
    const reports = [];
    for (const [name, service] of this.reports) {
      reports.push({
        name,
        ...service.getMetadata()
      });
    }
    return reports;
  }

  /**
   * Setup Express routes for all reports
   */
  setupRoutes() {
    // Route to list all available reports
    this.router.get('/', (req, res) => {
      res.json({
        message: 'Available reports',
        reports: this.getAllReports()
      });
    });

    // Dynamic route for each report
    this.router.get('/:reportName', async (req, res) => {
      const { reportName } = req.params;
      const { format = 'pdf', ...params } = req.query;

      try {
        const reportService = this.getReport(reportName);
        
        if (!reportService) {
          return res.status(404).json({
            error: 'Report not found',
            availableReports: this.getAllReports().map(r => r.name)
          });
        }

        // Generate the report
        const result = await reportService.generateReport(params);

        if (format === 'html') {
          // Return HTML for preview
          res.setHeader('Content-Type', 'text/html');
          res.send(result.html);
        } else if (format === 'json') {
          // Return JSON data
          res.json(result.data);
        } else {
          // Return PDF (default)
          const filename = `${reportName}-report-${Date.now()}.pdf`;
          res.setHeader('Content-Disposition', `inline; filename=${filename}`);
          res.setHeader('Content-Type', 'application/pdf');
          res.send(result.pdfBuffer);
        }

      } catch (error) {
        console.error(`Error generating ${reportName} report:`, error);
        
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({
          error: 'Internal server error',
          message: error.message
        });
      }
    });

    // Route to get report metadata
    this.router.get('/:reportName/info', (req, res) => {
      const { reportName } = req.params;
      const reportService = this.getReport(reportName);
      
      if (!reportService) {
        return res.status(404).json({
          error: 'Report not found',
          availableReports: this.getAllReports().map(r => r.name)
        });
      }

      res.json({
        name: reportName,
        ...reportService.getMetadata()
      });
    });
  }

  /**
   * Get the Express router
   */
  getRouter() {
    return this.router;
  }
}

module.exports = ReportManager; 