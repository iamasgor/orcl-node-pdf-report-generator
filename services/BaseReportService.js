const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const getConnection = require('../db');

class BaseReportService {
  constructor() {
    this.templatePath = '';
    this.reportName = '';
  }

  /**
   * Get database connection
   */
  async getConnection() {
    return await getConnection();
  }

  /**
   * Fetch data for the report - to be implemented by child classes
   */
  async fetchData(params) {
    throw new Error('fetchData method must be implemented by child class');
  }

  /**
   * Render the EJS template with data
   */
  async renderTemplate(data) {
    if (!this.templatePath) {
      throw new Error('Template path not set');
    }
    
    const fullTemplatePath = path.join(__dirname, '..', this.templatePath);
    return await ejs.renderFile(fullTemplatePath, data);
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(html, options = {}) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...options
      };

      return await page.pdf(pdfOptions);
    } finally {
      await browser.close();
    }
  }

  /**
   * Main method to generate the complete report
   */
  async generateReport(params, pdfOptions = {}) {
    let connection = null;
    
    try {
      // Fetch data
      const data = await this.fetchData(params);
      
      // Render template
      const html = await this.renderTemplate(data);
      
      // Generate PDF
      const pdfBuffer = await this.generatePDF(html, pdfOptions);
      
      return {
        pdfBuffer,
        data,
        html
      };
    } catch (error) {
      console.error(`Error generating ${this.reportName} report:`, error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }
    }
  }

  /**
   * Get report metadata
   */
  getMetadata() {
    return {
      name: this.reportName,
      templatePath: this.templatePath,
      description: this.description || ''
    };
  }
}

module.exports = BaseReportService; 