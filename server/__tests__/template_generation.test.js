const path = require('path');
const fs = require('fs');
const { generateHtmlFromTemplate } = require('../utils/helper');

describe('generateHtmlFromTemplate', () => {
  const templatesDir = path.resolve(__dirname, '..', 'utils', 'templates');
  const fixtureName = 'test_template.handlebars';
  const fixturePath = path.join(templatesDir, fixtureName);

  beforeAll(() => {
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    fs.writeFileSync(fixturePath, 'Hello {{name}}');
  });

  afterAll(() => {
    try { fs.unlinkSync(fixturePath); } catch {}
  });

  it('returns null and warns when template is missing', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = generateHtmlFromTemplate({ template: 'missing_file.handlebars', content: { name: 'World' } });
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('Template file missing_file.handlebars not found.');
    warnSpy.mockRestore();
  });

  it('compiles and injects content when template exists', () => {
    const html = generateHtmlFromTemplate({ template: fixtureName, content: { name: 'World' } });
    expect(html).toBe('Hello World');
  });
});
