import { expect, test } from '@jupyterlab/galata';

test('extension activates', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto('http://localhost:8888/lab');

  expect(
    logs.filter(s => s === "JupyterLab MAAP Algorithms Registration extension is activated!")
  ).toHaveLength(1);
});
