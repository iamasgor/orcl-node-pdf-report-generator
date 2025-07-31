const express = require('express');
const router = express.Router();
const getConnection = require('../db');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

router.get('/doa', async (req, res) => {
  // const id = req.params.id;
  const id = req.query.id;
  let connection;

  try {
    connection = await getConnection();

    // Get user info
    const userResult = await connection.execute(
      `SELECT NAME, EMAIL, TO_CHAR(JOIN_DATE, 'YYYY-MM-DD') FROM USERS WHERE ID = :id`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found');
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
      { outFormat: getConnection.OBJECT } // use object format for easier EJS rendering
    );
    const items = itemResult.rows;

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
