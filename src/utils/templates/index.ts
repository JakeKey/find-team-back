export const getVerificationTemplateHTML = (username: string, href: string) => `
  <!DOCTYPE html>
  <html>
    <body>
      <table
        width="100%"
        bgcolor="#fff"
        border="0"
        cellpadding="0"
        cellspacing="0"
        style="
          color: #444444;
          font-size: 0.9em;
          word-wrap: break-word;
          table-layout: fixed;
          font-family: Arial, Verdana, sans-serif;
        "
      >
        <tbody>
          <tr>
            <td
              style="
                padding: 10px 20px;
                font-size: 1.2em;
                font-family: Arial, Helvetica, sans-serif;
              "
              colspan="3"
            >
              <h1>Welcome to Find Team <b>${username}</b>!</h1>
              <a target="_blank" href="${href}">Click here</a> to verify your email address
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>`;
