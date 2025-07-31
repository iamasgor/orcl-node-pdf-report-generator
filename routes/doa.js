const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

router.get('/test', async (req, res) => {
  // const id = req.params.id;
  const id = req.query.id;
  let connection;

    let user = "Asgor";
    let items = [];
    
  try {
    // Render EJS to HTML
    const html = await ejs.renderFile(path.join(__dirname, '../views/doa.ejs'), {
      ...user,
      items
    });

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });      

    await browser.close();

    // res.setHeader('Content-Disposition', `attachment; filename=user-report-${id}.pdf`);
    res.setHeader('Content-Disposition', `inline; filename=user-report-${id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error(e);
      }
    }
  }
});

module.exports = router;
