## 📝 HTML to PDF For Oracle Database 
PDF Report Generator with Node.js, Express, Puppeteer, EJS & OracleDB

This Node.js application generates dynamic PDF reports using Express, Puppeteer, and EJS templates (pure HTML and CSS), with data sourced from an Oracle database. Ideal for building printable reports or exporting data to PDF in real-time.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env`:
```
PORT=3000
# Add your database configuration here
```

3. Start the server:
```bash
node index.js
```

## 📊 Report System Architecture

The application uses a modular report system that makes it easy to add new reports:

### Structure
```
services/
├── BaseReportService.js          # Base class with common functionality
├── ReportManager.js              # Manages all reports and routes
└── reports/
    ├── DoaReportService.js       # DOA report implementation
    ├── TestReportService.js      # Test report implementation
    └── [YourNewReport].js        # Your new reports go here

utils/
└── ReportTemplate.js             # Template for creating new reports

views/
├── doa.ejs                       # DOA report template
├── style.css                     # Shared styles
└── [your-template].ejs          # Your new templates go here
```

## ➕ Adding a New Report

### Step 1: Create the Report Service

Copy the template and create your report service:

```javascript
// services/reports/YourReportService.js
const BaseReportService = require('../BaseReportService');

class YourReportService extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'Your Report Name';
    this.templatePath = 'views/your-template.ejs';
    this.description = 'Description of your report';
  }

  async fetchData(params) {
    const connection = await this.getConnection();
    
    try {
      // Your database queries here
      const result = await connection.execute(
        `SELECT * FROM your_table WHERE condition = :param`,
        [params.param]
      );
      
      return {
        title: 'Your Report Title',
        data: result.rows,
        summary: {
          total: result.rows.length,
          date: new Date().toISOString()
        }
      };
    } finally {
      await connection.close();
    }
  }
}

module.exports = YourReportService;
```

### Step 2: Create the EJS Template

Create your template in the `views/` directory:

```html
<!-- views/your-template.ejs -->
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1><%= title %></h1>
    <p>Generated on: <%= summary.date %></p>
    
    <table>
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
            </tr>
        </thead>
        <tbody>
            <% data.forEach(function(item) { %>
                <tr>
                    <td><%= item.column1 %></td>
                    <td><%= item.column2 %></td>
                </tr>
            <% }); %>
        </tbody>
    </table>
</body>
</html>
```

### Step 3: Register the Report

Add your report to the ReportManager:

```javascript
// services/ReportManager.js
const YourReportService = require('./reports/YourReportService');

class ReportManager {
  registerDefaultReports() {
    this.registerReport('doa', new DoaReportService());
    this.registerReport('test', new TestReportService());
    this.registerReport('your-report', new YourReportService()); // Add this line
  }
}
```

That's it! Your report is now available at `/api/reports/your-report`.

## 🌐 API Endpoints

### List All Reports
```
GET /api/reports
```
Returns a list of all available reports.

### Generate Report
```
GET /api/reports/{reportName}?param1=value1&param2=value2&format=pdf
```

**Parameters:**
- `reportName`: The name of the report to generate
- `param1, param2, ...`: Parameters specific to your report
- `format`: Output format (`pdf`, `html`, or `json`)

**Examples:**
```bash
# Generate DOA report as PDF
GET /api/reports/doa?id=123

# Generate report as HTML for preview
GET /api/reports/doa?id=123&format=html

# Get report data as JSON
GET /api/reports/doa?id=123&format=json
```

### Get Report Information
```
GET /api/reports/{reportName}/info
```
Returns metadata about a specific report.

## 🔧 Available Reports

### DOA Report (`/api/reports/doa`)
- **Description**: Delegation of Authority Report
- **Parameters**: `id` (user ID)
- **Template**: `views/doa.ejs`

### Test Report (`/api/reports/test`)
- **Description**: Test Report for development purposes
- **Parameters**: None
- **Template**: `views/doa.ejs`

## 🎨 Customization

### Custom PDF Options
Override the `generateReport` method in your report service:

```javascript
async generateReport(params, pdfOptions = {}) {
  const customPdfOptions = {
    format: 'A4',
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    ...pdfOptions
  };
  
  return await super.generateReport(params, customPdfOptions);
}
```

### Custom Error Handling
Add custom error handling in your `fetchData` method:

```javascript
async fetchData(params) {
  if (!params.requiredParam) {
    throw new Error('Required parameter missing');
  }
  
  // Your logic here
}
```

## 🚀 Benefits of This Architecture

1. **Easy to Add**: Just create a new service class and register it
2. **Consistent**: All reports use the same base functionality
3. **Flexible**: Support for PDF, HTML, and JSON output
4. **Maintainable**: Common code is centralized
5. **Scalable**: Easy to add new features to all reports at once
6. **Testable**: Each report can be tested independently

## 🔍 Debugging

- Check the console for registered reports on startup
- Use `format=html` to preview your template
- Use `format=json` to see the raw data
- Check the browser's network tab for detailed error messages

## 📝 Example: Adding a Sales Report

Here's a complete example of adding a sales report:

1. **Create the service** (`services/reports/SalesReportService.js`):
```javascript
const BaseReportService = require('../BaseReportService');

class SalesReportService extends BaseReportService {
  constructor() {
    super();
    this.reportName = 'Sales Report';
    this.templatePath = 'views/sales.ejs';
    this.description = 'Monthly sales summary report';
  }

  async fetchData(params) {
    const { month, year } = params;
    const connection = await this.getConnection();
    
    try {
      const result = await connection.execute(
        `SELECT product_name, quantity, price, total 
         FROM sales 
         WHERE EXTRACT(MONTH FROM sale_date) = :month 
         AND EXTRACT(YEAR FROM sale_date) = :year`,
        [month, year]
      );
      
      return {
        month,
        year,
        sales: result.rows,
        totalSales: result.rows.reduce((sum, row) => sum + row[3], 0)
      };
    } finally {
      await connection.close();
    }
  }
}

module.exports = SalesReportService;
```

2. **Create the template** (`views/sales.ejs`):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Sales Report - <%= month %>/<%= year %></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Sales Report</h1>
    <h2><%= month %>/<%= year %></h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <% sales.forEach(function(sale) { %>
                <tr>
                    <td><%= sale[0] %></td>
                    <td><%= sale[1] %></td>
                    <td>$<%= sale[2] %></td>
                    <td>$<%= sale[3] %></td>
                </tr>
            <% }); %>
        </tbody>
    </table>
    
    <h3>Total Sales: $<%= totalSales %></h3>
</body>
</html>
```

3. **Register the report** in `ReportManager.js`:
```javascript
const SalesReportService = require('./reports/SalesReportService');
// In registerDefaultReports():
this.registerReport('sales', new SalesReportService());
```

4. **Use the report**:
```bash
GET /api/reports/sales?month=12&year=2024
```
